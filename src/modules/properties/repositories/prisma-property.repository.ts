import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/database/prisma/prisma.service';
import { Flat, Property } from 'src/generated/prisma/client';
import {
    CreateFlatInput,
    CreatePropertyInput,
    IPropertyRepository,
} from '../interfaces/property-repository.interface';

@Injectable()
export class PrismaPropertyRepository implements IPropertyRepository {
    constructor(private readonly prisma: PrismaService) {}

    createProperty(data: CreatePropertyInput): Promise<Property> {
        return this.prisma.property.create({ data });
    }

    findPropertyById(id: number): Promise<Property | null> {
        return this.prisma.property.findFirst({
            where: { id, isDeleted: false },
            include: { admin: true, flats: { where: { isDeleted: false } } } as any,
        });
    }

    findPropertiesByCommunityId(communityId: number): Promise<Property[]> {
        return this.prisma.property.findMany({
            where: { communityId, isDeleted: false },
            include: { admin: true } as any,
        });
    }

    updateProperty(id: number, data: Partial<CreatePropertyInput>): Promise<Property> {
        return this.prisma.property.update({ where: { id }, data });
    }

    assignAdmin(propertyId: number, adminId: number): Promise<Property> {
        return this.prisma.property.update({
            where: { id: propertyId },
            data: { adminId },
        });
    }

    softDeleteProperty(id: number): Promise<Property> {
        return this.prisma.property.update({
            where: { id },
            data: { isDeleted: true, deletedAt: new Date() },
        });
    }

    createFlat(data: CreateFlatInput): Promise<Flat> {
        return this.prisma.flat.create({ data });
    }

    findFlatById(id: number): Promise<Flat | null> {
        return this.prisma.flat.findFirst({
            where: { id, isDeleted: false },
            include: { owner: true } as any,
        });
    }

    findFlatsByPropertyId(propertyId: number): Promise<Flat[]> {
        return this.prisma.flat.findMany({
            where: { propertyId, isDeleted: false },
            include: { owner: true } as any,
        });
    }

    assignFlatOwner(flatId: number, ownerId: number): Promise<Flat> {
        return this.prisma.flat.update({
            where: { id: flatId },
            data: { ownerId },
        });
    }

    softDeleteFlat(id: number): Promise<Flat> {
        return this.prisma.flat.update({
            where: { id },
            data: { isDeleted: true, deletedAt: new Date() },
        });
    }
}