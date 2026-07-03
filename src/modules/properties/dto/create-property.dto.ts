import { IsEnum, IsInt, IsOptional, IsString, Min } from 'class-validator';
import { PropertyType } from 'src/generated/prisma/client';

export class CreatePropertyDto {
    @IsString()
    name: string;

    @IsEnum(PropertyType)
    type: PropertyType;

    @IsOptional()
    @IsString()
    address?: string;

    @IsOptional()
    @IsInt()
    @Min(1)
    totalFlats?: number;
}