import { IsEnum, IsOptional, IsString } from 'class-validator';
import { ComplainStatus } from 'src/generated/prisma/client';

export class UpdateStatusDto {
    @IsEnum(ComplainStatus)
    status: ComplainStatus;

    @IsOptional()
    @IsString()
    rejectionNote?: string;
}