import { IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class CreateCommunityDto {
    @IsString()
    @MinLength(3)
    @MaxLength(100)
    name: string;

    @IsOptional()
    @IsString()
    registrationNo?: string;

    @IsOptional()
    @IsString()
    description?: string;

    @IsString()
    address: string;

    @IsOptional()
    @IsString()
    city?: string;

    @IsOptional()
    @IsString()
    country?: string;

    @IsOptional()
    @IsString()
    logoUrl?: string;
}