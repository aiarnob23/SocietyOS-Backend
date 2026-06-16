import { Injectable } from "@nestjs/common";
import { CreateUserInput, IUserRepository } from "../interfaces/user-repository.interface";
import { PrismaService } from "src/database/prisma/prisma.service";
import { User } from "src/generated/prisma/client";


@Injectable()
export class PrismaUserRepository implements IUserRepository {
    constructor(private readonly prisma: PrismaService) { }
    // create user
    create(data: CreateUserInput): Promise<User> {
        return this.prisma.user.create({
            data
        });
    }
    // find user by email
    findByEmail(email: string): Promise<User | null> {
        return this.prisma.user.findUnique({
            where: {
                email
            }
        });
    }
    // find self profile by id
    getSelfProfileById(id: number) {
        return this.prisma.user.findUnique({
            where: {
                id
            },
            select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                phone: true,
                role: true,
                avatarUrl: true,
                communityId: true,
            }
        });
    }
    // find user by id
    getUserById(id: number) {
        return this.prisma.user.findUnique({
            where: {
                id
            },
            select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                phone: true,
                avatarUrl: true,
                communityId: true
            }
        })
    }
}