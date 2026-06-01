import { User } from "src/generated/prisma/client";

export const USER_REPOSITORY = Symbol('USER_REPOSITORY');

export interface CreateUserInput {
    email: string;
}

export interface IUserRepository {
    create(data: CreateUserInput): Promise<User>;
    findByEmail(email: string): Promise<User | null>;
}