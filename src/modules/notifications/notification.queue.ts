import { Inject, Injectable } from '@nestjs/common';
import { Queue } from 'bullmq';
import { QUEUES } from 'src/core/queues/queue.constants';
import {
    NotificationChannel,
    NotificationPayload,
} from '../notifications/interfaces/notification-strategy.interface';
export interface NotificationJob {
    channel: NotificationChannel;
    payload: NotificationPayload;
}

@Injectable()
export class NotificationQueue {
    constructor(
        @Inject(QUEUES.NOTIFICATION)
        private readonly queue: Queue,
    ) { }

    async add(channel: NotificationChannel, payload: NotificationPayload): Promise<void> {
        await this.queue.add(
            'send',
            { channel, payload } as NotificationJob,
            {
                attempts: 3,
                backoff: { type: 'exponential', delay: 5000 },
                removeOnComplete: true,
                removeOnFail: false,
            },
        );
    }
}