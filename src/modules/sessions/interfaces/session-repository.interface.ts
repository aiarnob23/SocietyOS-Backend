import { UserSession } from "src/generated/prisma/client";

export const SESSION_REPOSITORY = Symbol('SESSION_REPOSITORY');
export interface ICreateSessionInput {
    userId: number;
    refreshTokenHash: string;
    userAgent?: string;
    ipAddress?: string;
    expiresAt?: Date;
    lastLoginAt?: Date;
}

export interface ISessionRepository {
    createSession(data: ICreateSessionInput): Promise<UserSession>;
    findValidSession(userId: number): Promise<UserSession[]>;
    rotateRefreshToken(sessionId: number, refreshTokenHash: string): Promise<UserSession>;
    revokeSession(sessionId: number): Promise<void>;
}