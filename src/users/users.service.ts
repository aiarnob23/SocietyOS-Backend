import { Inject, Injectable } from '@nestjs/common';
import { CreateUserInput, USER_REPOSITORY } from './interfaces/user-repository.interface';
import type { IUserRepository } from './interfaces/user-repository.interface';
import { User } from 'src/generated/prisma/client';

@Injectable()
export class UsersService {
    constructor(
        @Inject(USER_REPOSITORY)
        private readonly userRepository: IUserRepository,
    ) { }

    async createUser(data: CreateUserInput): Promise<User> {
        return this.userRepository.create(data);
    }

    async findByEmail(email: string): Promise<User | null> {
        return this.userRepository.findByEmail(email);
    }
}
