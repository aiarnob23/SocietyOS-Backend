import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/database/prisma/prisma.service';
import { Plan, PlanVersion, PlanType } from 'src/generated/prisma/client';
import {
    CreatePlanInput,
    CreatePlanVersionInput,
    IPlanRepository,
} from '../interfaces/plan-repository.interface';

@Injectable()
export class PrismaPlanRepository implements IPlanRepository {
    constructor(private readonly prisma: PrismaService) {}

    createPlan(data: CreatePlanInput): Promise<Plan> {
        return this.prisma.plan.create({ data });
    }

    createPlanVersion(data: CreatePlanVersionInput): Promise<PlanVersion> {
        return this.prisma.planVersion.create({ data });
    }

    findAllPublicPlans(): Promise<(Plan & { planVersions: PlanVersion[] })[]> {
        return this.prisma.plan.findMany({
            where: { isPublic: true },
            include: {
                planVersions: {
                    where: { isActive: true },
                    orderBy: { effectiveFrom: 'desc' },
                    take: 1,
                },
            },
        });
    }

    findPlanByType(type: PlanType): Promise<(Plan & { planVersions: PlanVersion[] }) | null> {
        return this.prisma.plan.findUnique({
            where: { type },
            include: {
                planVersions: {
                    where: { isActive: true },
                    orderBy: { versionNumber: 'desc' },
                },
            },
        });
    }

    findActiveVersionByPlanId(planId: number): Promise<PlanVersion | null> {
        return this.prisma.planVersion.findFirst({
            where: { planId, isActive: true },
            orderBy: { versionNumber: 'desc' },
        });
    }

    async deactivatePreviousVersions(planId: number): Promise<void> {
        await this.prisma.planVersion.updateMany({
            where: { planId, isActive: true },
            data: { isActive: false },
        });
    }
}