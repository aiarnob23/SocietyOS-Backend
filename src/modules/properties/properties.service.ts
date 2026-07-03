import { Inject, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/database/prisma/prisma.service';
import { AppLogger } from 'src/core/logging/logger.service';
import { NotFoundException } from 'src/core/exceptions/not-found.exceptions';
import { ForbiddenException } from 'src/core/exceptions/forbidden.exception';
import { ErrorCodes } from 'src/core/exceptions/error-codes';
import { UserRole } from 'src/generated/prisma/client';
import { JwtPayload } from '../auth/token.service';
import {
    IPropertyRepository,
    PROPERTY_REPOSITORY,
} from './interfaces/property-repository.interface';
import { CreatePropertyDto } from './dto/create-property.dto';
import { UpdatePropertyDto } from './dto/update-property.dto';
import { AssignAdminDto } from './dto/assign-admin.dto';
import { CreateFlatDto } from './dto/create-flat.dto';

@Injectable()
export class PropertiesService {
    constructor(
        @Inject(PROPERTY_REPOSITORY)
        private readonly propertyRepository: IPropertyRepository,
        private readonly prisma: PrismaService,
        private readonly logger: AppLogger,
    ) {}

    // ── Property ─────────────────────────────────────────

    async createProperty(currentUser: JwtPayload, dto: CreatePropertyDto) {
        // find community
        const community = await this.prisma.community.findFirst({
            where: { createdById: currentUser.userId, isDeleted: false },
        });

        if (!community) {
            throw new NotFoundException(
                ErrorCodes.NOT_FOUND,
                'You do not have a community',
            );
        }

        const property = await this.propertyRepository.createProperty({
            communityId: community.id,
            name: dto.name,
            type: dto.type,
            address: dto.address,
            totalFlats: dto.totalFlats,
        });

        this.logger.info('Property created', {
            propertyId: property.id,
            communityId: community.id,
            userId: currentUser.userId,
        });

        return property;
    }

    async getPropertiesByCommunity(currentUser: JwtPayload) {
        const community = await this.prisma.community.findFirst({
            where: { createdById: currentUser.userId, isDeleted: false },
        });

        if (!community) {
            throw new NotFoundException(ErrorCodes.NOT_FOUND, 'Community not found');
        }

        return this.propertyRepository.findPropertiesByCommunityId(community.id);
    }

    async getPropertyById(id: number) {
        const property = await this.propertyRepository.findPropertyById(id);
        if (!property) {
            throw new NotFoundException(ErrorCodes.NOT_FOUND, 'Property not found');
        }
        return property;
    }

    async updateProperty(currentUser: JwtPayload, id: number, dto: UpdatePropertyDto) {
        await this.verifyPropertyAccess(currentUser, id);
        const updated = await this.propertyRepository.updateProperty(id, dto);

        this.logger.info('Property updated', { propertyId: id, userId: currentUser.userId });
        return updated;
    }

    async assignPropertyAdmin(currentUser: JwtPayload, propertyId: number, dto: AssignAdminDto) {
        await this.verifyPropertyAccess(currentUser, propertyId);

        // check if user exists
        const user = await this.prisma.user.findUnique({
            where: { id: dto.userId, isDeleted: false },
        });
        if (!user) {
            throw new NotFoundException(ErrorCodes.NOT_FOUND, 'User not found');
        }

        // make user PROPERTY_ADMIN
        await this.prisma.$transaction(async (tx) => {
            await tx.user.update({
                where: { id: dto.userId },
                data: {
                    role: UserRole.PROPERTY_ADMIN,
                    communityId: (await this.propertyRepository.findPropertyById(propertyId))!.communityId,
                },
            });

            await tx.property.update({
                where: { id: propertyId },
                data: { adminId: dto.userId },
            });
        });

        this.logger.info('Property admin assigned', {
            propertyId,
            adminId: dto.userId,
            userId: currentUser.userId,
        });

        return this.propertyRepository.findPropertyById(propertyId);
    }

    async deleteProperty(currentUser: JwtPayload, id: number) {
        await this.verifyPropertyAccess(currentUser, id);
        await this.propertyRepository.softDeleteProperty(id);

        this.logger.info('Property deleted', { propertyId: id, userId: currentUser.userId });
        return { message: 'Property deleted successfully' };
    }

    // ── Flat ─────────────────────────────────────────────

    async createFlat(currentUser: JwtPayload, propertyId: number, dto: CreateFlatDto) {
        await this.verifyPropertyAccess(currentUser, propertyId);

        const flat = await this.propertyRepository.createFlat({
            propertyId,
            unitNumber: dto.unitNumber,
            floor: dto.floor,
        });

        this.logger.info('Flat created', {
            flatId: flat.id,
            propertyId,
            userId: currentUser.userId,
        });

        return flat;
    }

    async getFlatsByProperty(propertyId: number) {
        await this.getPropertyById(propertyId);
        return this.propertyRepository.findFlatsByPropertyId(propertyId);
    }

    async assignFlatOwner(currentUser: JwtPayload, flatId: number, dto: AssignAdminDto) {
        const flat = await this.propertyRepository.findFlatById(flatId);
        if (!flat) {
            throw new NotFoundException(ErrorCodes.NOT_FOUND, 'Flat not found');
        }

        await this.verifyPropertyAccess(currentUser, flat.propertyId);

        const user = await this.prisma.user.findUnique({
            where: { id: dto.userId, isDeleted: false },
        });
        if (!user) {
            throw new NotFoundException(ErrorCodes.NOT_FOUND, 'User not found');
        }

        // make user FLAT_OWNER
        await this.prisma.$transaction(async (tx) => {
            await tx.user.update({
                where: { id: dto.userId },
                data: { role: UserRole.FLAT_OWNER },
            });

            await tx.flat.update({
                where: { id: flatId },
                data: { ownerId: dto.userId },
            });
        });

        this.logger.info('Flat owner assigned', {
            flatId,
            ownerId: dto.userId,
            userId: currentUser.userId,
        });

        return this.propertyRepository.findFlatById(flatId);
    }

    async deleteFlat(currentUser: JwtPayload, flatId: number) {
        const flat = await this.propertyRepository.findFlatById(flatId);
        if (!flat) {
            throw new NotFoundException(ErrorCodes.NOT_FOUND, 'Flat not found');
        }

        await this.verifyPropertyAccess(currentUser, flat.propertyId);
        await this.propertyRepository.softDeleteFlat(flatId);

        this.logger.info('Flat deleted', { flatId, userId: currentUser.userId });
        return { message: 'Flat deleted successfully' };
    }

    // ── Private helpers ───────────────────────────────────

    private async verifyPropertyAccess(currentUser: JwtPayload, propertyId: number) {
        const property = await this.propertyRepository.findPropertyById(propertyId);
        if (!property) {
            throw new NotFoundException(ErrorCodes.NOT_FOUND, 'Property not found');
        }

        // SUPER_ADMIN will get all access
        if (currentUser.role === UserRole.SUPER_ADMIN) return property;

        // COMMUNITY_ADMIN — own community
        if (currentUser.role === UserRole.COMMUNITY_ADMIN) {
            const community = await this.prisma.community.findFirst({
                where: { createdById: currentUser.userId, isDeleted: false },
            });
            if (community?.id !== property.communityId) {
                throw new ForbiddenException(
                    ErrorCodes.FORBIDDEN,
                    'You do not have access to this property',
                );
            }
            return property;
        }

        // PROPERTY_ADMIN — own property
        if (currentUser.role === UserRole.PROPERTY_ADMIN) {
            if (property.adminId !== currentUser.userId) {
                throw new ForbiddenException(
                    ErrorCodes.FORBIDDEN,
                    'You do not have access to this property',
                );
            }
            return property;
        }

        throw new ForbiddenException(ErrorCodes.FORBIDDEN, 'Access denied');
    }
}