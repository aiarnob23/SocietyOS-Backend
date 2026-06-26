import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { Worker, Job } from 'bullmq';
import { config } from 'src/core/config';
import { QUEUES } from 'src/core/queues/queue.constants';
import { AppLogger } from 'src/core/logging/logger.service';
import { NotificationRegistry } from '../notifications.registry';
import { NotificationJob } from '../notification.queue';

@Injectable()
export class NotificationProcessor implements OnModuleInit, OnModuleDestroy {
    private worker: Worker;

    constructor(
        private readonly registry: NotificationRegistry,
        private readonly logger: AppLogger,
    ) {}

    onModuleInit() {
        this.worker = new Worker(
            QUEUES.NOTIFICATION,
            async (job: Job<NotificationJob>) => {
                const { channel, payload } = job.data;

                this.logger.info('Processing notification', {
                    channel,
                    event: payload.event,
                    userId: payload.userId,
                });

                const strategy = this.registry.get(channel);
                await strategy.send(payload);
            },
            {
                connection: {
                    host: config.redis.host,
                    port: config.redis.port,
                },
            },
        );

        this.worker.on('failed', (job, err) => {
            this.logger.logError('Notification job failed', {
                jobId: job?.id,
                error: err.message,
            });
        });
    }

    async onModuleDestroy() {
        await this.worker.close();
    }
}