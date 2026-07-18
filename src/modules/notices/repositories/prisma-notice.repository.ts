import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/database/prisma/prisma.service';
import { Notice, UserRole } from 'src/generated/prisma/client';
import { CreateNoticeInput, INoticeRepository } from '../interfaces/notice-repository.interface';


const noticeInclude = {
    createdBy: {
        select: { id: true, firstName: true, lastName: true },
    },
    noticeTargetRoles: {
        select: { role: true },
    },
} as any;

@Injectable()
export class PrismaNoticeRepository implements INoticeRepository {
    constructor(private readonly prisma: PrismaService) {}

    async create(data: CreateNoticeInput): Promise<Notice> {
        return this.prisma.notice.create({
            data: {
                communityId: data.communityId,
                createdById: data.createdById,
                title: data.title,
                description: data.description,
                noticeTargetRoles: {
                    create: data.targetRoles.map((role) => ({ role })),
                },
            },
            include: noticeInclude,
        });
    }

    findById(id: number): Promise<Notice | null> {
        return this.prisma.notice.findFirst({
            where: { id, isDeleted: false },
            include: noticeInclude,
        });
    }

    findByCommunityId(communityId: number): Promise<Notice[]> {
        return this.prisma.notice.findMany({
            where: { communityId, isDeleted: false },
            orderBy: { createdAt: 'desc' },
            include: noticeInclude,
        });
    }

    findByRoleAndCommunity(communityId: number, role: UserRole): Promise<Notice[]> {
        return this.prisma.notice.findMany({
            where: {
                communityId,
                isDeleted: false,
                noticeTargetRoles: {
                    some: { role },
                },
            },
            orderBy: { createdAt: 'desc' },
            include: noticeInclude,
        });
    }

    update(id: number, data: Partial<{ title: string; description: string }>): Promise<Notice> {
        return this.prisma.notice.update({
            where: { id },
            data,
            include: noticeInclude,
        });
    }

    async softDelete(id: number): Promise<void> {
        await this.prisma.notice.update({
            where: { id },
            data: { isDeleted: true, deletedAt: new Date() },
        });
    }
}