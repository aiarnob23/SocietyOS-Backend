import { Flat, Property, PropertyType } from 'src/generated/prisma/client';

export const PROPERTY_REPOSITORY = 'PROPERTY_REPOSITORY';

export interface CreatePropertyInput {
    communityId: number;
    name: string;
    type: PropertyType;
    address?: string;
    totalFlats?: number;
}

export interface CreateFlatInput {
    propertyId: number;
    unitNumber: string;
    floor?: number;
}

export interface IPropertyRepository {
    createProperty(data: CreatePropertyInput): Promise<Property>;
    findPropertyById(id: number): Promise<Property | null>;
    findPropertiesByCommunityId(communityId: number): Promise<Property[]>;
    updateProperty(id: number, data: Partial<CreatePropertyInput>): Promise<Property>;
    assignAdmin(propertyId: number, adminId: number): Promise<Property>;
    softDeleteProperty(id: number): Promise<Property>;

    createFlat(data: CreateFlatInput): Promise<Flat>;
    findFlatById(id: number): Promise<Flat | null>;
    findFlatsByPropertyId(propertyId: number): Promise<Flat[]>;
    assignFlatOwner(flatId: number, ownerId: number): Promise<Flat>;
    softDeleteFlat(id: number): Promise<Flat>;
}