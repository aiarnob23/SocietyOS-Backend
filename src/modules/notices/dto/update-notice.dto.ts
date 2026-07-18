import { IsOptional, IsString } from 'class-validator';

export class UpdateNoticeDto {
    @IsOptional()
    @IsString()
    title?: string;

    @IsOptional()
    @IsString()
    description?: string;
}