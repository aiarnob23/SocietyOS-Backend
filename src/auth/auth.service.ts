import { Injectable } from '@nestjs/common';
import { UsersService } from 'src/users/users.service';
import { RegisterDto } from './dto/register.dto';
import { User } from 'src/generated/prisma/client';
import { ConflictException } from 'src/core/exceptions/conflict.exceptions';
import { ErrorCodes } from 'src/core/exceptions/error-codes';

@Injectable()
export class AuthService {
    constructor(
        private readonly usersService: UsersService,
    ) { }

    async register(dto: RegisterDto): Promise<User> {
        const existingUser = await this.usersService.findByEmail(dto.email);
        if (existingUser) {
            throw new ConflictException(
                ErrorCodes.EMAIL_ALREADY_EXISTS,
                'This email is already registered',
            )
        }
        const user = await this.usersService.createUser({
            email: dto.email,
            phone: dto.phone,
            firstName: dto.firstName,
            lastName: dto.lastName,
            role: dto.role,
            passwordHash: dto.password,
            avatarUrl: dto.avatarUrl,
            communityId: dto.communityId
        });
        return user;
    }
}
