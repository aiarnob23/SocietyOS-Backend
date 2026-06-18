import { Inject, Injectable } from "@nestjs/common";
import { ISessionRepository, SESSION_REPOSITORY } from "./interfaces/session-repository.interface";
import { EncryptionService } from "src/core/security/encryption/encryption.service";
@Injectable()
export class SessionService {
    private readonly SALT_ROUNDS = 8;
    constructor(
        @Inject(SESSION_REPOSITORY)
        private readonly sessionRepository: ISessionRepository,
        private readonly EncryptionService: EncryptionService,
    ) { }

    // Create a new session
    async createSession(
        userId: number,
        refreshToken: string,
        meta?: { userAgent?: string, ipAddress?: string, expiresAt?: Date},
    ) {
        const refreshTokenHash = await this.EncryptionService.hash(refreshToken);

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
            const isMatch = await this.EncryptionService.verify(session.refreshTokenHash, refreshToken);
            if (isMatch) return session;
        }
        return null;
    }

    //rotate refresh token
    async rotateRefreshToken(sessionId: number, refreshToken: string) {
        const refreshTokenHash = await this.EncryptionService.hash(refreshToken);
        return this.sessionRepository.rotateRefreshToken(sessionId, refreshTokenHash);
    }

    //revoke session
    async revokeSession(sessionId: number) {
        return this.sessionRepository.revokeSession(sessionId);
    }

    //delete revoked and expired sessions
    async deleteExpiredAndRevokedSessions() {
        return this.sessionRepository.deleteExpiredAndRevokedSessions();
    }
}