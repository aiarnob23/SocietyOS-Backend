import { Community } from 'src/generated/prisma/client';

export const COMMUNITY_REPOSITORY = 'COMMUNITY_REPOSITORY';

export interface CreateCommunityInput {
    name: string;
    slug: string;
    registrationNo?: string;
    description?: string;
    address: string;
    city?: string;
    country?: string;
    logoUrl?: string;
    createdById: number;
}

export interface ICommunityRepository {
    create(data: CreateCommunityInput): Promise<Community>;
    findBySlug(slug: string): Promise<Community | null>;
    findById(id: number): Promise<Community | null>;
    findByCreatedById(userId: number): Promise<Community | null>;
    update(id: number, data: Partial<CreateCommunityInput>): Promise<Community>;
    softDelete(id: number): Promise<Community>;
}