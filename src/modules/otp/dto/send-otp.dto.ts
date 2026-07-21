import { IsEmail, IsEnum, IsOptional, IsInt } from 'class-validator';
import { OTPType } from 'src/generated/prisma/client';

export class SendOTPDto {
    @IsEmail()
    identifier: string;

    @IsEnum(OTPType)
    type: OTPType;

    @IsOptional()
    @IsInt()
    userId?: number;
}