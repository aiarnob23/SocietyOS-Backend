import { IsEnum } from 'class-validator';
import { BillingInterval, PlanType } from 'src/generated/prisma/client';

export class CreateSubscriptionDto {
    @IsEnum(PlanType)
    planType: PlanType;

    @IsEnum(BillingInterval)
    billingInterval: BillingInterval;
}