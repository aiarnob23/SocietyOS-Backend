import { Notice } from "src/generated/prisma/client";
import { UserRole } from "src/generated/prisma/enums";

export const NOTICE_REPOSITORY = Symbol('NOTICE_REPOSITORY');

export interface CreateNoticeInput {
  communityId: number;
  createdById: number;
  title: string;
  description: string;
  targetRoles: UserRole[];
}

export interface INoticeRepository {
    create(data: CreateNoticeInput): Promise<Notice>;
    findById(id: number): Promise<Notice | null>;
    findByCommunityId(communityId: number): Promise<Notice[]>;
    findByRoleAndCommunity(communityId: number, role: UserRole): Promise<Notice[]>;
    update(id: number, data: Partial<{ title: string; description: string }>): Promise<Notice>;
    softDelete(id: number): Promise<void>;
}