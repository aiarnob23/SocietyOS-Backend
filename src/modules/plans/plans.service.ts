import { Inject, Injectable } from '@nestjs/common';
import { PlanType } from 'src/generated/prisma/client';
import { AppLogger } from 'src/core/logging/logger.service';
import { NotFoundException } from 'src/core/exceptions/not-found.exceptions';
import { ConflictException } from 'src/core/exceptions/conflict.exceptions';
import { ErrorCodes } from 'src/core/exceptions/error-codes';
import {
    IPlanRepository,
    PLAN_REPOSITORY,
} from './interfaces/plan-repository.interface';
import { CreatePlanDto } from './dto/create-plan.dto';
import { CreatePlanVersionDto } from './dto/create-plan-version.dto';

@Injectable()
export class PlansService {
    constructor(
        @Inject(PLAN_REPOSITORY)
        private readonly planRepository: IPlanRepository,
        private readonly logger: AppLogger,
    ) { }

    // all public plans
    async getAllPublicPlans() {
        const plans = await this.planRepository.findAllPublicPlans();
        return plans;
    }

    // plan by type
    async getPlanByType(type: PlanType) {
        const plan = await this.planRepository.findPlanByType(type);
        if (!plan) {
            throw new NotFoundException(
                ErrorCodes.NOT_FOUND,
                `Plan not found: ${type}`,
            );
        }
        return plan;
    }

    // create new plan — admin only
    async createPlan(dto: CreatePlanDto) {
        const existing = await this.planRepository.findPlanByType(dto.type);
        if (existing) {
            throw new ConflictException(
                ErrorCodes.CONFLICT,
                `Plan already exists: ${dto.type}`,
            );
        }

        const plan = await this.planRepository.createPlan(dto);
        this.logger.info('Plan created', { planId: plan.id, type: plan.type });
        return plan;
    }

    // create new plan version — admin only
    async createPlanVersion(type: PlanType, dto: CreatePlanVersionDto) {
        const plan = await this.planRepository.findPlanByType(type);
        if (!plan) {
            throw new NotFoundException(
                ErrorCodes.NOT_FOUND,
                `Plan not found: ${type}`,
            );
        }

        // deactivate previous versions
        await this.planRepository.deactivatePreviousVersions(plan.id);

        const latestVersion = plan.planVersions[0];
        const newVersionNumber = latestVersion
            ? latestVersion.versionNumber + 1
            : 1;

        const version = await this.planRepository.createPlanVersion({
            planId: plan.id,
            versionNumber: newVersionNumber,
            price: dto.price,
            maxCommunities: dto.maxCommunities,
            maxUsers: dto.maxUsers,
            customReporting: dto.customReporting,
            apiAccess: dto.apiAccess,
            supportLevel: dto.supportLevel,
            billingInterval: dto.billingInterval,
            trialDays: dto.trialDays,
            effectiveFrom: new Date(dto.effectiveFrom),
            effectiveTo: dto.effectiveTo ? new Date(dto.effectiveTo) : undefined,
        });

        this.logger.info('Plan version created', {
            planId: plan.id,
            versionId: version.id,
            versionNumber: version.versionNumber,
        });

        return version;
    }
}