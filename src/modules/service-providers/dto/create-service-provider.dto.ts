import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ServiceCategory } from 'src/generated/prisma/client';

export class CreateServiceProviderDto {
    @IsString()
    @IsNotEmpty()
    name: string;

    @IsEnum(ServiceCategory)
    category: ServiceCategory;

    @IsString()
    @IsOptional()
    phone?: string;

    @IsString()
    @IsOptional()
    email?: string;

    @IsString()
    @IsOptional()
    address?: string;

    @IsString()
    @IsOptional()
    description?: string;
}