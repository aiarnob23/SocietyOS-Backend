import {
    IsEnum, IsNumber, IsOptional,
    IsBoolean, IsString, IsDateString, Min,
} from 'class-validator';
import { BillingInterval } from 'src/generated/prisma/client';

export class CreatePlanVersionDto {
    @IsNumber()
    @Min(0)
    price: number;

    @IsNumber()
    maxCommunities: number;

    @IsOptional()
    @IsNumber()
    maxUsers?: number;

    @IsOptional()
    @IsBoolean()
    customReporting?: boolean;

    @IsOptional()
    @IsBoolean()
    apiAccess?: boolean;

    @IsOptional()
    @IsString()
    supportLevel?: string;

    @IsEnum(BillingInterval)
    billingInterval: BillingInterval;

    @IsOptional()
    @IsNumber()
    trialDays?: number;

    @IsDateString()
    effectiveFrom: string;

    @IsOptional()
    @IsDateString()
    effectiveTo?: string;
}