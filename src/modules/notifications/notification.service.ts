import { Injectable, OnModuleInit } from '@nestjs/common';
import { AppLogger } from 'src/core/logging/logger.service';
import { EmailStrategy } from './strategies/email/email.strategy';
import { NotificationRegistry } from './notifications.registry';
import { NotificationChannel, NotificationEvent, NotificationPayload } from './interfaces/notification-strategy.interface';
import { NotificationQueue } from './notification.queue';

@Injectable()
export class NotificationsService implements OnModuleInit {
    constructor(
        private readonly registry: NotificationRegistry,
        private readonly notificationQueue: NotificationQueue,
        private readonly emailStrategy: EmailStrategy,
        private readonly logger: AppLogger,
    ) {}

    onModuleInit() {
        this.registry.register(this.emailStrategy);
    }

    async send(
        channel: NotificationChannel,
        event: NotificationEvent,
        userId: number,
        data: Record<string, any>,
    ): Promise<void> {
        const payload: NotificationPayload = { userId, event, data };
        await this.notificationQueue.add(channel, payload);

        this.logger.info('Notification queued', { channel, event, userId });
    }
}