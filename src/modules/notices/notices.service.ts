import { Inject, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/database/prisma/prisma.service';
import { AppLogger } from 'src/core/logging/logger.service';
import { NotFoundException } from 'src/core/exceptions/not-found.exceptions';
import { ForbiddenException } from 'src/core/exceptions/forbidden.exception';
import { ErrorCodes } from 'src/core/exceptions/error-codes';
import { UserRole } from 'src/generated/prisma/client';
import { JwtPayload } from '../auth/token.service';

import {
    INoticeRepository,
    NOTICE_REPOSITORY,
} from './interfaces/notice-repository.interface';
import { CreateNoticeDto } from './dto/create-notice.dto';
import { UpdateNoticeDto } from './dto/update-notice.dto';
import { NotificationsService } from '../notifications/notification.service';

@Injectable()
export class NoticesService {
    constructor(
        @Inject(NOTICE_REPOSITORY)
        private readonly noticeRepository: INoticeRepository,
        private readonly prisma: PrismaService,
        private readonly notificationsService: NotificationsService,
        private readonly logger: AppLogger,
    ) {}

    //create new notice
    async createNotice(currentUser: JwtPayload, dto: CreateNoticeDto) {
        const community = await this.prisma.community.findFirst({
            where: { createdById: currentUser.userId, isDeleted: false },
        });

        if (!community) {
            throw new ForbiddenException(
                ErrorCodes.FORBIDDEN,
                'You do not have permission to create a notice',
            );
        }

        const notice = await this.noticeRepository.create({
            communityId: community.id,
            createdById: currentUser.userId,
            title: dto.title,
            description: dto.description,
            targetRoles: dto.targetRoles,
        });

        this.logger.info('Notice created', {
            noticeId: notice.id,
            communityId: community.id,
            targetRoles: dto.targetRoles,
        });

        if (dto.sendEmail) {
            await this.sendEmailToTargetRoles(
                community.id,
                dto.targetRoles,
                notice,
            );
        }

        return notice;
    }

    //get notice by id
    async getNoticeById(id: number) {
        const notice = await this.noticeRepository.findById(id);
        if (!notice) {
            throw new NotFoundException(ErrorCodes.NOT_FOUND, 'Notice not found');
        }
        return notice;
    }

    // admin — get all community notices
    async getCommunityNotices(currentUser: JwtPayload) {
        const community = await this.prisma.community.findFirst({
            where: { createdById: currentUser.userId, isDeleted: false },
        });

        if (!community) {
            throw new ForbiddenException(
                ErrorCodes.FORBIDDEN,
                'Community not found',
            );
        }

        return this.noticeRepository.findByCommunityId(community.id);
    }

    // get my notices
    async getMyNotices(currentUser: JwtPayload) {
        const user = await this.prisma.user.findUnique({
            where: { id: currentUser.userId },
        });

        if (!user?.communityId) {
            throw new ForbiddenException(
                ErrorCodes.FORBIDDEN,
                'You must be part of a community to view notices',
            );
        }

        return this.noticeRepository.findByRoleAndCommunity(
            user.communityId,
            currentUser.role as UserRole,
        );
    }

    // update notice
    async updateNotice(currentUser: JwtPayload, id: number, dto: UpdateNoticeDto) {
        const notice = await this.getNoticeById(id);

        if (
            (notice as any).createdById !== currentUser.userId &&
            currentUser.role !== UserRole.SUPER_ADMIN
        ) {
            throw new ForbiddenException(
                ErrorCodes.FORBIDDEN,
                'You do not have permission to update this notice',
            );
        }

        const updated = await this.noticeRepository.update(id, dto);
        this.logger.info('Notice updated', { noticeId: id, userId: currentUser.userId });
        return updated;
    }

    // delete notice
    async deleteNotice(currentUser: JwtPayload, id: number) {
        const notice = await this.getNoticeById(id);

        const canDelete =
            (notice as any).createdById === currentUser.userId ||
            currentUser.role === UserRole.SUPER_ADMIN;

        if (!canDelete) {
            throw new ForbiddenException(
                ErrorCodes.FORBIDDEN,
                'You do not have permission to delete this notice',
            );
        }

        await this.noticeRepository.softDelete(id);
        this.logger.info('Notice deleted', { noticeId: id, userId: currentUser.userId });
        return { message: 'Notice deleted successfully' };
    }

    // send email
    private async sendEmailToTargetRoles(
        communityId: number,
        targetRoles: UserRole[],
        notice: any,
    ) {
        const users = await this.prisma.user.findMany({
            where: {
                communityId,
                role: { in: targetRoles },
                isDeleted: false,
                emailVerifiedAt: { not: null },
            },
            select: {
                id: true,
                email: true,
                firstName: true,
            },
        });

        // প্রত্যেককে email পাঠাও
        await Promise.all(
            users.map((user) =>
                this.notificationsService.send(
                    'EMAIL',
                    'NOTICE_PUBLISHED',
                    user.id,
                    {
                        email: user.email,
                        firstName: user.firstName,
                        noticeTitle: notice.title,
                        noticeDescription: notice.description,
                    },
                ),
            ),
        );

        this.logger.info('Notice emails queued', {
            noticeId: notice.id,
            recipientCount: users.length,
        });
    }
}