// src/modules/service-provider/service-provider.service.ts
import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { IServiceProviderRepository, SERVICE_PROVIDER_REPOSITORY } from './interfaces/service-providers-repository.interface';
import { CreateServiceProviderDto } from './dto/create-service-provider.dto';


@Injectable()
export class ServiceProviderService {
    constructor(
        @Inject(SERVICE_PROVIDER_REPOSITORY)
        private readonly repo: IServiceProviderRepository,
    ) {}

    create(communityId: number, addedById: number, dto: CreateServiceProviderDto) {
        return this.repo.create({ communityId, addedById, ...dto });
    }

    async findById(id: number) {
        const provider = await this.repo.findById(id);
        if (!provider) throw new NotFoundException('SERVICE_PROVIDER_NOT_FOUND', 'Service provider not found');
        return provider;
    }

    findByCommunity(communityId: number, category?: string) {
        return this.repo.findByCommunity(communityId, category);
    }

    async update(id: number, dto: Partial<CreateServiceProviderDto>) {
        await this.findById(id);
        return this.repo.update(id, dto);
    }

    async remove(id: number) {
        await this.findById(id);
        return this.repo.softDelete(id);
    }
}