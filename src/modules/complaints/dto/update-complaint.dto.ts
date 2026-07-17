import { IsEnum, IsOptional, IsString } from 'class-validator';
import { ComplainCategory, ComplainPriority } from 'src/generated/prisma/client';

export class UpdateComplaintDto {
    @IsOptional()
    @IsString()
    title?: string;

    @IsOptional()
    @IsString()
    description?: string;

    @IsOptional()
    @IsEnum(ComplainCategory)
    category?: ComplainCategory;

    @IsOptional()
    @IsEnum(ComplainPriority)
    priority?: ComplainPriority;
}