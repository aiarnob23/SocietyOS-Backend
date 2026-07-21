import { BadRequestException, Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { Queue } from 'bullmq';
import * as crypto from 'crypto';
import * as argon2 from 'argon2';
import { OTPType } from 'src/generated/prisma/client';
import { AppLogger } from 'src/core/logging/logger.service';
import { QUEUES } from 'src/core/queues/queue.constants';
import { ErrorCodes } from 'src/core/exceptions/error-codes';
import { IOTPRepository, OTP_REPOSITORY } from './interfaces/otp-repository.interface';
import {
    OTP_EXPIRY_MINUTES,
    OTP_MAX_ATTEMPTS,
    OTP_MAX_SENDS_PER_HOUR,
    OTP_RESEND_COOLDOWN_MINUTES,
} from './otp.constants';
import { NotificationsService } from '../notifications/notification.service';

@Injectable()
export class OTPService implements OnModuleInit {
    constructor(
        @Inject(OTP_REPOSITORY)
        private readonly otpRepository: IOTPRepository,
        @Inject(QUEUES.CLEANUP)
        private readonly otpCleanupQueue: Queue,
        private readonly notificationsService: NotificationsService,
        private readonly logger: AppLogger,
    ) {}

    async onModuleInit() {
        await this.otpCleanupQueue.add(
            'cleanup',
            {},
            {
                repeat: { every: 20 * 60 * 1000 },
                removeOnComplete: true,
            },
        );
    }

    async sendOTP(identifier: string, type: OTPType, userId?: number) {
        const email = identifier.toLowerCase().trim();

        const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
        const recentCount = await this.otpRepository.countRecentByIdentifier(
            email, type, oneHourAgo,
        );

        if (recentCount >= OTP_MAX_SENDS_PER_HOUR) {
            throw new BadRequestException(
                ErrorCodes.TOO_MANY_REQUESTS,
                'Too many OTP requests. Please wait an hour.',
            );
        }

        const recentOTP = await this.otpRepository.findLatestActive(email, type);
        if (recentOTP) {
            const cooldownEnd = new Date(
                recentOTP.createdAt.getTime() + OTP_RESEND_COOLDOWN_MINUTES * 60 * 1000,
            );
            if (new Date() < cooldownEnd) {
                const waitSeconds = Math.ceil((cooldownEnd.getTime() - Date.now()) / 1000);
                throw new BadRequestException(
                    ErrorCodes.TOO_MANY_REQUESTS,
                    `Please wait ${waitSeconds} seconds before requesting a new OTP.`,
                );
            }
        }

        await this.otpRepository.deleteByIdentifierAndType(email, type);

        // নতুন OTP generate করো
        const code = this.generateCode();
        const codeHash = await argon2.hash(code);
        const expiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);

        await this.otpRepository.create({
            identifier: email,
            codeHash,
            type,
            userId,
            expiresAt,
        });

        // email পাঠাও
        await this.notificationsService.send('EMAIL', 'OTP_SENT', userId ?? 0, {
            email,
            code,
            type,
            expiresAt,
            expiryMinutes: OTP_EXPIRY_MINUTES,
        });

        this.logger.info('OTP sent', {
            identifier: this.maskEmail(email),
            type,
        });

        return {
            message: 'OTP sent successfully',
            expiresAt,
        };
    }

    async verifyOTP(identifier: string, code: string, type: OTPType): Promise<boolean> {
        const email = identifier.toLowerCase().trim();

        const otp = await this.otpRepository.findLatestActive(email, type);

        if (!otp) {
            throw new BadRequestException(
                ErrorCodes.INVALID_OTP,
                'Invalid or expired OTP',
            );
        }

        // expire check
        if (new Date() > otp.expiresAt) {
            await this.otpRepository.deleteById(otp.id);
            throw new BadRequestException(
                ErrorCodes.INVALID_OTP,
                'OTP has expired. Please request a new one.',
            );
        }

        // max attempts check
        if (otp.attempts >= OTP_MAX_ATTEMPTS) {
            await this.otpRepository.deleteById(otp.id);
            throw new BadRequestException(
                ErrorCodes.INVALID_OTP,
                'Maximum attempts exceeded. Please request a new OTP.',
            );
        }

        // verify code
        const isValid = await argon2.verify(otp.codeHash, code);

        if (!isValid) {
            const updated = await this.otpRepository.incrementAttempts(otp.id);
            const remaining = OTP_MAX_ATTEMPTS - updated.attempts;

            if (remaining <= 0) {
                await this.otpRepository.deleteById(otp.id);
                throw new BadRequestException(
                    ErrorCodes.INVALID_OTP,
                    'Maximum attempts exceeded. Please request a new OTP.',
                );
            }

            throw new BadRequestException(
                ErrorCodes.INVALID_OTP,
                `Invalid OTP. ${remaining} attempts remaining.`,
            );
        }

        // verified
        await this.otpRepository.markVerified(otp.id);

        this.logger.info('OTP verified', {
            identifier: this.maskEmail(email),
            type,
        });

        return true;
    }

    private generateCode(): string {
        return crypto.randomInt(100000, 999999).toString();
    }

    private maskEmail(email: string): string {
        const [local, domain] = email.split('@');
        if (local.length <= 2) return email;
        return `${local[0]}${'*'.repeat(local.length - 2)}${local[local.length - 1]}@${domain}`;
    }
}