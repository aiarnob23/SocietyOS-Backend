import { Injectable } from '@nestjs/common';
import { UsersService } from 'src/users/users.service';
import { RegisterDto } from './dto/register.dto';
import { User } from 'src/generated/prisma/client';

@Injectable()
export class AuthService {
    constructor(
        private readonly usersService: UsersService,
    ) { }

    async register(dto: RegisterDto): Promise<User> {
        const user = await this.usersService.createUser({
            email: dto.email,
        });
        return user;
    }
}
