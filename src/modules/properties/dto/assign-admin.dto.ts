import { IsInt } from 'class-validator';

export class AssignAdminDto {
    @IsInt()
    userId: number;
}