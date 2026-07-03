import { Inject, Injectable } from '@nestjs/common';
import { AppLogger } from 'src/core/logging/logger.service';
import { NotFoundException } from 'src/core/exceptions/not-found.exceptions';
import { ConflictException } from 'src/core/exceptions/conflict.exceptions';
import { ForbiddenException } from 'src/core/exceptions/forbidden.exception';
import { ErrorCodes } from 'src/core/exceptions/error-codes';
import { PrismaService } from 'src/database/prisma/prisma.service';
import { SubscriptionStatus, UserRole } from 'src/generated/prisma/client';
import {
    ICommunityRepository,
    COMMUNITY_REPOSITORY,
} from './interfaces/community-repository.interface';
import { CreateCommunityDto } from './dto/create-community.dto';
import { UpdateCommunityDto } from './dto/update-community.dto';
import { JwtPayload } from '../auth/token.service';

@Injectable()
export class CommunitiesService {
    constructor(
        @Inject(COMMUNITY_REPOSITORY)
        private readonly communityRepository: ICommunityRepository,
        private readonly prisma: PrismaService,
        private readonly logger: AppLogger,
    ) {}

    async createCommunity(currentUser: JwtPayload, dto: CreateCommunityDto) {
        // role check — community admin
        if (currentUser.role !== UserRole.COMMUNITY_ADMIN) {
            throw new ForbiddenException(
                ErrorCodes.FORBIDDEN,
                'Only community admins with active subscription can create a community',
            );
        }

        // active subscription check
        const subscription = await this.prisma.subscription.findFirst({
            where: {
                userId: currentUser.userId,
                status: SubscriptionStatus.ACTIVE,
            },
            include: { planVersion: true },
        });

        if (!subscription) {
            throw new ForbiddenException(
                ErrorCodes.FORBIDDEN,
                'Active subscription required to create a community',
            );
        }

        // community check
        const existing = await this.communityRepository.findByCreatedById(currentUser.userId);
        if (existing) {
            throw new ConflictException(
                ErrorCodes.CONFLICT,
                'You already have a community',
            );
        }

        // slug generate 
        const slug = this.generateSlug(dto.name);

        // slug unique check
        const slugExists = await this.communityRepository.findBySlug(slug);
        if (slugExists) {
            throw new ConflictException(
                ErrorCodes.CONFLICT,
                'Community with similar name already exists',
            );
        }

        const community = await this.prisma.$transaction(async (tx) => {
            // community create
            const newCommunity = await tx.community.create({
                data: {
                    name: dto.name,
                    slug,
                    registrationNo: dto.registrationNo,
                    description: dto.description,
                    address: dto.address,
                    city: dto.city,
                    country: dto.country ?? 'BD',
                    logoUrl: dto.logoUrl,
                    createdById: currentUser.userId,
                },
            });

            // update user's community
            await tx.user.update({
                where: { id: currentUser.userId },
                data: { communityId: newCommunity.id },
            });

            return newCommunity;
        });

        this.logger.info('Community created', {
            communityId: community.id,
            slug: community.slug,
            userId: currentUser.userId,
        });

        return community;
    }

    async getCommunityBySlug(slug: string) {
        const community = await this.communityRepository.findBySlug(slug);
        if (!community) {
            throw new NotFoundException(
                ErrorCodes.NOT_FOUND,
                'Community not found',
            );
        }
        return community;
    }

    async getMyCommunity(userId: number) {
        const community = await this.communityRepository.findByCreatedById(userId);
        if (!community) {
            throw new NotFoundException(
                ErrorCodes.NOT_FOUND,
                'You do not have a community yet',
            );
        }
        return community;
    }

    async updateCommunity(currentUser: JwtPayload, id: number, dto: UpdateCommunityDto) {
        const community = await this.communityRepository.findById(id);
        if (!community) {
            throw new NotFoundException(ErrorCodes.NOT_FOUND, 'Community not found');
        }

        // owner check
        if (
            community.createdById !== currentUser.userId &&
            currentUser.role !== UserRole.SUPER_ADMIN
        ) {
            throw new ForbiddenException(
                ErrorCodes.FORBIDDEN,
                'You do not have permission to update this community',
            );
        }

        const updated = await this.communityRepository.update(id, dto);

        this.logger.info('Community updated', { communityId: id, userId: currentUser.userId });

        return updated;
    }

    async deleteCommunity(currentUser: JwtPayload, id: number) {
        const community = await this.communityRepository.findById(id);
        if (!community) {
            throw new NotFoundException(ErrorCodes.NOT_FOUND, 'Community not found');
        }

        if (currentUser.role !== UserRole.SUPER_ADMIN) {
            throw new ForbiddenException(
                ErrorCodes.FORBIDDEN,
                'Only super admins can delete communities',
            );
        }

        await this.communityRepository.softDelete(id);

        this.logger.info('Community deleted', { communityId: id, userId: currentUser.userId });

        return { message: 'Community deleted successfully' };
    }

    // slug generate
    private generateSlug(name: string): string {
        return name
            .toLowerCase()
            .trim()
            .replace(/[^a-z0-9\s-]/g, '')
            .replace(/\s+/g, '-')
            .replace(/-+/g, '-');
    }
}