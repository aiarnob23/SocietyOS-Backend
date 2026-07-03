import { ServiceCategory, ServiceProvider} from 'src/generated/prisma/client';

export const SERVICE_PROVIDER_REPOSITORY = Symbol('SERVICE_PROVIDER_REPOSITORY');

export interface ICreateServiceProviderInput {
    communityId: number;
    addedById: number;
    name: string;
    category: ServiceCategory;
    phone?: string;
    email?: string;
    address?: string;
    description?: string;
    logoUrl?: string;
}

export interface IServiceProviderRepository {
    create(data: ICreateServiceProviderInput): Promise<ServiceProvider>;
    findById(id: number): Promise<ServiceProvider | null>;
    findByCommunity(communityId: number, category?: string): Promise<ServiceProvider[]>;
    update(id: number, data: Partial<ICreateServiceProviderInput>): Promise<ServiceProvider>;
    softDelete(id: number): Promise<void>;
}