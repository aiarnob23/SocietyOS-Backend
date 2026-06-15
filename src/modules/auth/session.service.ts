import { Injectable } from "@nestjs/common";
import { PrismaService } from "src/database/prisma/prisma.service";
import * as bcrypt from 'bcrypt';

@Injectable()
export class SessionService {
    private readonly SALT_ROUNDS = 8;
    constructor(private readonly prisma: PrismaService) { }

    // Create a new session
    async createSession(userId: number, refreshToken: string, meta?: {
        userAgent?: string,
        ipAddress?: string,
        expiresAt?: Date,
    }) {
        const refreshTokenHash = await bcrypt.hash(refreshToken, this.SALT_ROUNDS);

        return this.prisma.userSession.create({
            data: {
                userId,
                refreshTokenHash,
                userAgent: meta?.userAgent,
                ipAddress: meta?.ipAddress,
                expiresAt: meta?.expiresAt,
                lastLoginAt: new Date(),
            },
        });
    }

    //find valid session
    async findValidSession(userId: number, refreshToken: string) {
        const sessions = await this.prisma.userSession.findMany({
            where: {
                userId,
                isRevoked: false,
            }
        });
        for (const session of sessions) {
            const isMatch = await bcrypt.compare(refreshToken, session.refreshTokenHash);
            if (isMatch) return session;
        }
        return null;
    }

    //revoke session
    async revokeSession(sessionId: number) {
        return this.prisma.userSession.update({
            where: {
                id: sessionId,
            },
            data: { isRevoked: true },
        })
    }
}