import { User, UserRole } from "src/generated/prisma/client";

export const USER_REPOSITORY = Symbol('USER_REPOSITORY');

export interface CreateUserInput {
    email: string;
    phone?: string;
    firstName: string;
    lastName?: string;
    role: UserRole;
    passwordHash: string;
    avatarUrl?: string;
    communityId?: number;
    emailVerifiedAt?: Date | null;

}

export interface IUserRepository {
    create(data: CreateUserInput): Promise<User>;
    findByEmail(email: string): Promise<User | null>;
}