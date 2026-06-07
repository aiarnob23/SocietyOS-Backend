import { Transform } from "class-transformer";
import { IsEmail, IsEnum, IsOptional, IsPhoneNumber, IsString, Matches, MaxLength, MinLength } from "class-validator";
import { UserRole } from "src/generated/prisma/enums";

export class RegisterDto {
    @Transform(({ value }) => value?.trim().toLowerCase())
    @IsEmail()
    email: string;

    @IsOptional()
    @IsPhoneNumber()
    phone?: string;

    @Transform(({ value }) => value?.trim())
    @IsString()
    @MinLength(2)
    @MaxLength(50)
    firstName: string;

    @Transform(({ value }) => value?.trim())
    @IsString()
    @IsOptional()
    @MinLength(2)
    @MaxLength(50)
    lastName?: string;

    @IsEnum(UserRole)
    role: UserRole;

    @IsString()
    @IsOptional()
    avatarUrl?: string;

    @IsString()
    @MinLength(6)
    @MaxLength(72)
    @Matches(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/,
        {
            message:
                'Password must contain at least one uppercase letter, one lowercase letter and one number',
        },
    )
    password: string;

    @IsOptional()
    communityId?: number;
}