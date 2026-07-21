import { OTP } from "src/generated/prisma/client";
import { OTPType } from "src/generated/prisma/enums";

export const OTP_REPOSITORY = 'OTP_REPOSITORY';

export interface CreateOTPInput {
    identifier: string;
    codeHash: string;
    type: OTPType;
    userId?: number;
    expiresAt: Date;
}

export interface IOTPRepository {
    create(data: CreateOTPInput): Promise<OTP>;
    findLatestActive(identifier: string, type: OTPType): Promise<OTP | null>;
    incrementAttempts(id: number): Promise<OTP>;
    markVerified(id: number): Promise<OTP>;
    deleteById(id: number): Promise<void>;
    deleteByIdentifierAndType(identifier: string, type: OTPType): Promise<void>;
    countRecentByIdentifier(identifier: string, type: OTPType, since: Date): Promise<number>;
    deleteExpired(): Promise<number>;
}