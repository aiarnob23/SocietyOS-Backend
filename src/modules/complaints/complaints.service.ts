import { Inject, Injectable } from "@nestjs/common";
import { COMPLAINT_REPOSITORY, IComplaintRepository } from "./interfaces/complaints-repository.interface";
import { PrismaService } from "src/database/prisma/prisma.service";
import { AppLogger } from "src/core/logging/logger.service";
import { JwtPayload } from "../auth/token.service";
import { CreateComplaintDto } from "./dto/create-complaint.dto";
import { ForbiddenException } from "src/core/exceptions/forbidden.exception";
import { ErrorCodes } from "src/core/exceptions/error-codes";
import { NotFoundException } from "src/core/exceptions/not-found.exceptions";
import { UpdateStatusDto } from "./dto/update-status.dto";
import { ComplainStatus } from "src/generated/prisma/enums";

@Injectable()
export class ComplaintsService {
    constructor(
        @Inject(COMPLAINT_REPOSITORY)
        private readonly complaintRepository: IComplaintRepository,
        private readonly prisma: PrismaService,
        private readonly logger: AppLogger,
    ) { }

    // Create new complaint
    async createComplaint(currentUser: JwtPayload, dto: CreateComplaintDto) {
        const user = await this.prisma.user.findUnique({
            where: { id: currentUser.userId },
        });
        if (!user?.communityId) {
            throw new ForbiddenException(
                ErrorCodes.FORBIDDEN,
                'You must be a member of a community to create a complaint',
            );
        }

        const complaint = await this.complaintRepository.create({
            ...dto,
            priority: dto.priority || 'LOW',
            communityId: user.communityId,
            submittedById: currentUser.userId,
        })

        this.logger.info('Complaint created', { complaintId: complaint.id, userId: currentUser.userId });
        return complaint;
    }

    // Get complaints by id
    async getComplaintById(id: number) {
        const complaint = await this.complaintRepository.findById(id);
        if (!complaint) {
            throw new NotFoundException(
                ErrorCodes.NOT_FOUND,
                'Complaint not found',
            )
        }
        return complaint;
    }

    //get own complaints
    async getMyComplaints(currentUser: JwtPayload) {
        const complaints = await this.complaintRepository.findBySubmittedById(currentUser.userId);
        return complaints;
    }

    //get complaints by user id
    async getComplaintsByUserId(userId: number) {
        const complaints = await this.complaintRepository.findBySubmittedById(userId);
        return complaints;
    }

    //get complaints by community id - Admin only
    async getComplaintsByCommunityId(currentUser: JwtPayload) {
        const user = await this.prisma.user.findUnique({
            where: { id: currentUser.userId },
        })

        if (!user?.communityId) {
            throw new ForbiddenException(
                ErrorCodes.FORBIDDEN,
                'You must be a member of a community to view complaints',
            );
        }
        const complaints = await this.complaintRepository.findByCommunityId(user.communityId);
        this.logger.info(`Complaints retrieved for community ${user.communityId} count: ${complaints.length}`);
        return complaints;
    }

    //update status
    async updateStatus(currentUser: JwtPayload, id: number, dto: UpdateStatusDto) {
        const complaint = await this.getComplaintById(id);
        const now = new Date();
        const extraData: any = {};
        if(dto.status === ComplainStatus.RESOLVED) extraData.resolvedAt = now;
        if(dto.status === ComplainStatus.CLOSED) extraData.closedAt = now;
        if(dto.status === ComplainStatus.REJECTED) {
            extraData.rejectedAt = now;
            extraData.rejectionNote = dto.rejectionNote;
        }
        const updated = await this.complaintRepository.updateStatus(id, dto.status, extraData);
        this.logger.info('Complaint status updated', { complaintId: id, userId: currentUser.userId });
        return updated;
    }

}