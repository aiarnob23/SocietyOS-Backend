import { Inject, Injectable } from "@nestjs/common";
import { PrismaService } from "src/database/prisma/prisma.service";
import * as bcrypt from 'bcrypt';
import { ISessionRepository, SESSION_REPOSITORY } from "./interfaces/session-repository.interface";

@Injectable()
export class SessionService {
    private readonly SALT_ROUNDS = 8;
    constructor(
        @Inject(SESSION_REPOSITORY)
        private readonly sessionRepository: ISessionRepository,
    ) { }

    // Create a new session
    async createSession(
        userId: number,
        refreshToken: string,
        meta?: { userAgent?: string, ipAddress?: string, expiresAt?: Date, },
    ) {
        const refreshTokenHash = await bcrypt.hash(refreshToken, this.SALT_ROUNDS);

        return this.sessionRepository.createSession({
            userId,
            refreshTokenHash,
            lastLoginAt: new Date(),
            ...meta,
        });
    }

    //find valid session
    async findValidSession(userId: number, refreshToken: string) {
        const sessions = await this.sessionRepository.findValidSession(userId);
        for (const session of sessions) {
            const isMatch = await bcrypt.compare(refreshToken, session.refreshTokenHash);
            if (isMatch) return session;
        }
        return null;
    }

    //revoke session
    async revokeSession(sessionId: number) {
        return this.sessionRepository.revokeSession(sessionId);
    }
}