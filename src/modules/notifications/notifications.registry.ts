import { Injectable } from '@nestjs/common';
import { INotificationStrategy, NotificationChannel } from './interfaces/notification-strategy.interface';
import { NotFoundException } from 'src/core/exceptions/not-found.exceptions';
import { ErrorCodes } from 'src/core/exceptions/error-codes';

@Injectable()
export class NotificationRegistry {
    private readonly strategies = new Map<NotificationChannel, INotificationStrategy>();

    register(strategy: INotificationStrategy): void {
        this.strategies.set(strategy.channel, strategy);
    }

    get(channel: NotificationChannel): INotificationStrategy {
        const strategy = this.strategies.get(channel);
        if (!strategy) {
            throw new NotFoundException(
                ErrorCodes.NOT_FOUND,
                `No strategy found for channel: ${channel}`,
            );
        }
        return strategy;
    }
}