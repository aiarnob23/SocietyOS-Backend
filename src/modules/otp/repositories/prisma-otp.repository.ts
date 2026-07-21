import { Injectable } from "@nestjs/common";
import { CreateOTPInput, IOTPRepository } from "../interfaces/otp-repository.interface";
import { PrismaService } from "src/database/prisma/prisma.service";
import { OTP, OTPType } from "src/generated/prisma/client";

@Injectable()
export class PrismaOTPRepository implements IOTPRepository {
    constructor(private readonly prisma: PrismaService) { }

    create(data: CreateOTPInput): Promise<OTP> {
        return this.prisma.oTP.create({ data });
    }

    findLatestActive(identifier: string, type: OTPType): Promise<OTP | null> {
        return this.prisma.oTP.findFirst({
            where: { identifier, type, verified: false },
            orderBy: { createdAt: 'desc' },
        });
    }

    incrementAttempts(id: number): Promise<OTP> {
        return this.prisma.oTP.update({
            where: { id },
            data: { attempts: { increment: 1 } },
        });
    }

    markVerified(id: number): Promise<OTP> {
        return this.prisma.oTP.update({
            where: { id },
            data: { verified: true, verifiedAt: new Date() },
        });
    }

    async deleteById(id: number): Promise<void> {
        await this.prisma.oTP.delete({ where: { id } });
    }

    async deleteByIdentifierAndType(identifier: string, type: OTPType): Promise<void> {
        await this.prisma.oTP.deleteMany({ where: { identifier, type } });
    }

    countRecentByIdentifier(identifier: string, type: OTPType, since: Date): Promise<number> {
        return this.prisma.oTP.count({
            where: { identifier, type, createdAt: { gte: since } },
        });
    }

    async deleteExpired(): Promise<number> {
        const result = await this.prisma.oTP.deleteMany({
            where: { expiresAt: { lt: new Date() } },
        });
        return result.count;
    }
}