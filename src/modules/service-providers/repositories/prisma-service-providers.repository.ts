// src/modules/service-provider/repositories/prisma-service-provider.repository.ts
import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/database/prisma/prisma.service';
import { ServiceProvider } from 'src/generated/prisma/client';
import { ICreateServiceProviderInput, IServiceProviderRepository } from '../interfaces/service-providers-repository.interface';

@Injectable()
export class PrismaServiceProviderRepository implements IServiceProviderRepository {
    constructor(private readonly prisma: PrismaService) { }

    create(data: ICreateServiceProviderInput): Promise<ServiceProvider> {
        return this.prisma.serviceProvider.create({ data });
    }

    findById(id: number): Promise<ServiceProvider | null> {
        return this.prisma.serviceProvider.findFirst({
            where: { id, isDeleted: false },
        });
    }

    findByCommunity(communityId: number, category?: string): Promise<ServiceProvider[]> {
        return this.prisma.serviceProvider.findMany({
            where: {
                communityId,
                isDeleted: false,
                ...(category && { category: category as any }),
            },
            orderBy: { createdAt: 'desc' },
        });
    }

    update(id: number, data: Partial<ICreateServiceProviderInput>): Promise<ServiceProvider> {
        return this.prisma.serviceProvider.update({
            where: { id },
            data,
        });
    }

    async softDelete(id: number): Promise<void> {
        await this.prisma.serviceProvider.update({
            where: { id },
            data: { isDeleted: true, deletedAt: new Date() },
        });
    }

}