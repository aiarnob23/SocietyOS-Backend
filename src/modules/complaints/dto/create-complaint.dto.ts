import { IsEnum, IsInt, IsOptional, IsString, MinLength } from 'class-validator';
import { ComplainCategory, ComplainPriority } from 'src/generated/prisma/client';

export class CreateComplaintDto {
    @IsString()
    @MinLength(5)
    title: string;

    @IsString()
    @MinLength(10)
    description: string;

    @IsEnum(ComplainCategory)
    category: ComplainCategory;

    @IsOptional()
    @IsEnum(ComplainPriority)
    priority?: ComplainPriority;

    @IsOptional()
    @IsInt()
    propertyId?: number;

    @IsOptional()
    @IsInt()
    flatId?: number;
}