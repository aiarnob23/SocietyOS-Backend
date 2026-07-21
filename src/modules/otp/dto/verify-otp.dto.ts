import { IsEmail, IsEnum, IsString, Length } from 'class-validator';
import { OTPType } from 'src/generated/prisma/client';

export class VerifyOTPDto {
    @IsEmail()
    identifier: string;

    @IsString()
    @Length(6, 6)
    code: string;

    @IsEnum(OTPType)
    type: OTPType;
}