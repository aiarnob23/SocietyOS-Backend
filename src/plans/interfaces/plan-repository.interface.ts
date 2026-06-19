import { Plan, PlanVersion, PlanType, BillingInterval } from 'src/generated/prisma/client';

export const PLAN_REPOSITORY = Symbol('PLAN_REPOSITORY');

export interface CreatePlanInput {
    name: string;
    type: PlanType;
    description?: string;
    isPublic?: boolean;
}

export interface CreatePlanVersionInput {
    planId: number;
    versionNumber: number;
    price: number;
    maxCommunities: number;
    maxUsers?: number;
    customReporting?: boolean;
    apiAccess?: boolean;
    supportLevel?: string;
    billingInterval: BillingInterval;
    trialDays?: number;
    effectiveFrom: Date;
    effectiveTo?: Date;
}

export interface IPlanRepository {
    createPlan(data: CreatePlanInput): Promise<Plan>;
    createPlanVersion(data: CreatePlanVersionInput): Promise<PlanVersion>;
    findAllPublicPlans(): Promise<(Plan & { planVersions: PlanVersion[] })[]>;
    findPlanByType(type: PlanType): Promise<(Plan & { planVersions: PlanVersion[] }) | null>;
    findActiveVersionByPlanId(planId: number): Promise<PlanVersion | null>;
    deactivatePreviousVersions(planId: number): Promise<void>;
}