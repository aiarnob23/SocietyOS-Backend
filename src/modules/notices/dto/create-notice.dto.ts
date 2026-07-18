import {
    IsArray,
    IsBoolean,
    IsEnum,
    IsOptional,
    IsString,
    MinLength,
} from 'class-validator';
import { UserRole } from 'src/generated/prisma/client';

export class CreateNoticeDto {
    @IsString()
    @MinLength(3)
    title: string;

    @IsString()
    @MinLength(10)
    description: string;

    @IsArray()
    @IsEnum(UserRole, { each: true })
    targetRoles: UserRole[];

    @IsOptional()
    @IsBoolean()
    sendEmail?: boolean;  
}