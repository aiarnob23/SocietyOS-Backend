import {
    Complaint,
    ComplainCategory,
    ComplainPriority,
    ComplainStatus,
} from 'src/generated/prisma/client';

export const COMPLAINT_REPOSITORY = 'COMPLAINT_REPOSITORY';

export interface CreateComplaintInput {
    communityId: number;
    flatId?: number;
    propertyId?: number;
    submittedById: number;
    title: string;
    description: string;
    category: ComplainCategory;
    priority: ComplainPriority;
}

export interface IComplaintRepository {
    create(data: CreateComplaintInput): Promise<Complaint>;
    findById(id: number): Promise<Complaint | null>;
    findByCommunityId(communityId: number): Promise<Complaint[]>;
    findBySubmittedById(userId: number): Promise<Complaint[]>;
    updateStatus(id: number, status: ComplainStatus, data?: Partial<Complaint>): Promise<Complaint>;
    update(id: number, data: Partial<CreateComplaintInput>): Promise<Complaint>;
    softDelete(id: number): Promise<void>;
}