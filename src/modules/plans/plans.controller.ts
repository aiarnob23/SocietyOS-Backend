import { Body, Controller, Get, HttpCode, HttpStatus, Param, Post } from '@nestjs/common';
import { PlansService } from './plans.service';
import { CreatePlanDto } from './dto/create-plan.dto';
import { CreatePlanVersionDto } from './dto/create-plan-version.dto';
import { PlanType, UserRole } from 'src/generated/prisma/client';
import { Public } from 'src/core/decorators/public.decorator';
import { Roles } from 'src/core/decorators/roles.decorator';

@Controller('plans')
export class PlansController {
    constructor(private readonly plansService: PlansService) {}

    // all public plans
    @Public()
    @Get()
    @HttpCode(HttpStatus.OK)
    async getAllPlans() {
        const plans = await this.plansService.getAllPublicPlans();
        return {
            message: 'Plans fetched successfully',
            data: plans,
        };
    }

    // plan by type
    @Public()
    @Get(':type')
    @HttpCode(HttpStatus.OK)
    async getPlanByType(@Param('type') type: PlanType) {
        const plan = await this.plansService.getPlanByType(type);
        return {
            message: 'Plan fetched successfully',
            data: plan,
        };
    }

    // create new plan — admin only
    @Roles(UserRole.SUPER_ADMIN)
    @Post()
    @HttpCode(HttpStatus.CREATED)
    async createPlan(@Body() dto: CreatePlanDto) {
        const plan = await this.plansService.createPlan(dto);
        return {
            message: 'Plan created successfully',
            data: plan,
        };
    }

    // create new plan version — admin only
    @Roles(UserRole.SUPER_ADMIN)
    @Post(':type/versions')
    @HttpCode(HttpStatus.CREATED)
    async createPlanVersion(
        @Param('type') type: PlanType,
        @Body() dto: CreatePlanVersionDto,
    ) {
        const version = await this.plansService.createPlanVersion(type, dto);
        return {
            message: 'Plan version created successfully',
            data: version,
        };
    }
}