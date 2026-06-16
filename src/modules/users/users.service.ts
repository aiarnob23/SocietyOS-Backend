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
    //create user
    async createUser(data: CreateUserInput): Promise<User> {
        return this.userRepository.create(data);
    }
    //find user by email
    async findByEmail(email: string): Promise<User | null> {
        return this.userRepository.findByEmail(email);
    }
    //get self profile details by id
    async getSelfProfileById(id: number): Promise<User | null> {
       return await this.userRepository.getSelfProfileById(id);
    }
    //find user by id
    async getUserById(id: number): Promise<User | null> {
        return this.userRepository.getUserById(id);
    }
}
