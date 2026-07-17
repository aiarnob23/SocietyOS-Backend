import { Injectable } from "@nestjs/common";
import { CreateComplaintInput, IComplaintRepository } from "../interfaces/complaints-repository.interface";
import { PrismaService } from "src/database/prisma/prisma.service";
import { ComplainStatus, Complaint } from "src/generated/prisma/client";


@Injectable()
export class PrismaComplaintRepository implements IComplaintRepository {
    constructor(
        private readonly prisma: PrismaService
    ) { }

    create(data: CreateComplaintInput): Promise<Complaint> {
        return this.prisma.complaint.create({ data });
    }

    findById(id: number): Promise<Complaint | null> {
        return this.prisma.complaint.findFirst({
            where: { id, isDeleted: false },
            include: {
                submittedBy: {
                    select: { id: true, firstName: true, lastName: true, email: true },
                },
                property: { select: { id: true, name: true } },
                flat: { select: { id: true, unitNumber: true } },
            } as any,
        });
    }

    findByCommunityId(communityId: number): Promise<Complaint[]> {
        return this.prisma.complaint.findMany({
            where: { communityId, isDeleted: false },
            orderBy: { createdAt: 'desc' },
            include: {
                submittedBy: {
                    select: { id: true, firstName: true, lastName: true, email: true },
                },
                property: { select: { id: true, name: true } },
                flat: { select: { id: true, unitNumber: true } },
            } as any,
        })
    }

    findBySubmittedById(userId: number): Promise<Complaint[]> {
        return this.prisma.complaint.findMany({
            where: { submittedById: userId, isDeleted: false },
            orderBy: { createdAt: 'desc' },
        });
    }

    updateStatus(id: number, status: ComplainStatus, data?: Partial<Complaint>): Promise<Complaint> {
        return this.prisma.complaint.update({
            where: { id },
            data: { status, ...data },
        });
    }

    update(id: number, data: Partial<CreateComplaintInput>): Promise<Complaint> {
        return this.prisma.complaint.update({
            where: { id },
            data,
        });
    }

    async softDelete(id: number): Promise<void> {
        await this.prisma.complaint.update({
            where: { id },
            data: { isDeleted: true, deletedAt: new Date() },
        });
    }
}