import { IsInt, IsOptional, IsString } from 'class-validator';

export class CreateFlatDto {
    @IsString()
    unitNumber: string;

    @IsOptional()
    @IsInt()
    floor?: number;
}