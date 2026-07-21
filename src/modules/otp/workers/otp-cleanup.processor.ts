import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { Worker, Job } from 'bullmq';
import { Inject } from '@nestjs/common';
import { config } from 'src/core/config';
import { QUEUES } from 'src/core/queues/queue.constants';
import { AppLogger } from 'src/core/logging/logger.service';
import { IOTPRepository, OTP_REPOSITORY } from '../interfaces/otp-repository.interface';

@Injectable()
export class OTPCleanupProcessor implements OnModuleInit, OnModuleDestroy {
    private worker: Worker;

    constructor(
        @Inject(OTP_REPOSITORY)
        private readonly otpRepository: IOTPRepository,
        private readonly logger: AppLogger,
    ) {}

    onModuleInit() {
        this.worker = new Worker(
            QUEUES.CLEANUP,
            async (job: Job) => {
                if (job.name === 'cleanup') {
                    const count = await this.otpRepository.deleteExpired();
                    this.logger.info('OTP cleanup completed', { deletedCount: count });
                }
            },
            {
                connection: {
                    host: config.redis.host,
                    port: config.redis.port,
                },
            },
        );

        this.worker.on('failed', (job, err) => {
            this.logger.logError('OTP cleanup job failed', { error: err.message });
        });
    }

    async onModuleDestroy() {
        await this.worker.close();
    }
}