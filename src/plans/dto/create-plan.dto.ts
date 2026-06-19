import { IsEnum, IsString, IsOptional, IsBoolean } from 'class-validator';
import { PlanType } from 'src/generated/prisma/client';

export class CreatePlanDto {
    @IsString()
    name: string;

    @IsEnum(PlanType)
    type: PlanType;

    @IsOptional()
    @IsString()
    description?: string;

    @IsOptional()
    @IsBoolean()
    isPublic?: boolean;
}