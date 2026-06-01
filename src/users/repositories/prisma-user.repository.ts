import { Injectable } from "@nestjs/common";
import { CreateUserInput, IUserRepository } from "../interfaces/user-repository.interface";
import { PrismaService } from "src/database/prisma/prisma.service";
import { User } from "src/generated/prisma/client";


@Injectable()
export class PrismaUserRepository implements IUserRepository {
    constructor(private readonly prisma: PrismaService) {}

    create(data: CreateUserInput): Promise<User> {
        return this.prisma.user.create({
            data
        });
    }

    findByEmail(email: string): Promise<User | null> {
        return this.prisma.user.findUnique({
            where: {
                email
            }
        });
    }
}