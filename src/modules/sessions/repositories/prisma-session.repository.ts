import { Injectable } from "@nestjs/common";
import { PrismaService } from "src/database/prisma/prisma.service";
import { ICreateSessionInput, ISessionRepository } from "../interfaces/session-repository.interface";
import { UserSession } from "src/generated/prisma/client";

@Injectable()
export class PrismaSessionRepository implements ISessionRepository {
    constructor(private readonly prisma: PrismaService) { }

    createSession(data: ICreateSessionInput): Promise<UserSession> {
        return this.prisma.userSession.create({ data });
    }

    findValidSession(userId: number): Promise<UserSession[]> {
        return this.prisma.userSession.findMany({
            where: {
                userId,
                isRevoked: false
            },
        });
    }

    async revokeSession(sessionId: number): Promise<void> {
        await this.prisma.userSession.update({
            where: {
                id: sessionId,
            },
            data: { isRevoked: true },
        });
    }

    async rotateRefreshToken(sessionId: number, refreshTokenHash: string): Promise<UserSession> {
        return this.prisma.userSession.update({
            where: {
                id: sessionId,
            },
            data: { refreshTokenHash },
        });
    }

}