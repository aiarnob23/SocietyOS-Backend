import { Inject, Injectable, OnModuleDestroy, OnModuleInit } from "@nestjs/common";
import { Queue, Worker } from "bullmq";
import { QUEUES, SESSION_JOBS } from "src/core/queues/queue.constants";
import { SessionService } from "../sessions.service";
import { AppLogger } from "src/core/logging/logger.service";
import { config } from "src/core/config";

@Injectable()
export class SessionCleanupWorker implements OnModuleInit, OnModuleDestroy {
    private worker: Worker;

    constructor(
        @Inject(QUEUES.SESSION) private readonly sessionQueue: Queue,
        private readonly logger: AppLogger,
        private readonly sessionService: SessionService,
    ) { }


    async onModuleInit() {
        await this.registerRepeatableJobs();
        this.startWorker();
    }

    async onModuleDestroy() {
        await this.worker?.close();
    }

    //register repeatable jobs
    private async registerRepeatableJobs() {
        const schedulers = await this.sessionQueue.getJobSchedulers();
        for (const scheduler of schedulers) {
            if (scheduler.name === SESSION_JOBS.CLEANUP) {
                await this.sessionQueue.removeJobScheduler(scheduler.id as string);
            }
        }
        await this.sessionQueue.add(
            SESSION_JOBS.CLEANUP,
            {},
            {
                repeat: { pattern: '0 0 0 * * *' },
                jobId: 'session-cleanup',
            },
        )
    }
    //start worker fn
    private startWorker() {
        this.worker = new Worker(
            QUEUES.SESSION,
            async (job) => {
                if (job.name === SESSION_JOBS.CLEANUP) {
                    await this.handleCleanup();
                }
            },
            {
                connection: {
                    host: config.redis.host,
                    port: config.redis.port,
                },
            },
        );
        this.worker.on('completed', (job) => {
            this.logger.info(`[SessionCleanup] Job ${job.id} completed`);
        });
        this.worker.on('failed', (job, err) => {
            this.logger.error(`[SessionCleanup] Job ${job?.id} failed`, err.message);
        });
    }

    private async handleCleanup() {
        const count = await this.sessionService.deleteExpiredAndRevokedSessions();
        this.logger.info('Deleted expired and revoked sessions', { count });
    }
}