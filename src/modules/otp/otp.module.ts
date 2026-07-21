import { Module } from '@nestjs/common';
import { OTPService } from './otp.service';
import { PrismaOTPRepository } from './repositories/prisma-otp.repository';
import { OTP_REPOSITORY } from './interfaces/otp-repository.interface';
import { PrismaModule } from 'src/database/prisma/prisma.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { OTPCleanupProcessor } from './workers/otp-cleanup.processor';

@Module({
    imports: [PrismaModule, NotificationsModule],
    providers: [
        OTPService,
        OTPCleanupProcessor,
        PrismaOTPRepository,
        {
            provide: OTP_REPOSITORY,
            useClass: PrismaOTPRepository,
        },
    ],
    exports: [OTPService],
})
export class OTPModule {}