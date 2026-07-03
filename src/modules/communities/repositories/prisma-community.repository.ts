import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/database/prisma/prisma.service';
import { Community } from 'src/generated/prisma/client';
import {
    CreateCommunityInput,
    ICommunityRepository,
} from '../interfaces/community-repository.interface';

@Injectable()
export class PrismaCommunityRepository implements ICommunityRepository {
    constructor(private readonly prisma: PrismaService) {}

    create(data: CreateCommunityInput): Promise<Community> {
        return this.prisma.community.create({ data });
    }

    findBySlug(slug: string): Promise<Community | null> {
        return this.prisma.community.findUnique({
            where: { slug, isDeleted: false },
        });
    }

    findById(id: number): Promise<Community | null> {
        return this.prisma.community.findFirst({
            where: { id, isDeleted: false },
        });
    }

    findByCreatedById(userId: number): Promise<Community | null> {
        return this.prisma.community.findFirst({
            where: { createdById: userId, isDeleted: false },
        });
    }

    update(id: number, data: Partial<CreateCommunityInput>): Promise<Community> {
        return this.prisma.community.update({
            where: { id },
            data,
        });
    }

    softDelete(id: number): Promise<Community> {
        return this.prisma.community.update({
            where: { id },
            data: { isDeleted: true, deletedAt: new Date() },
        });
    }
}