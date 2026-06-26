import { Inject, Injectable } from '@nestjs/common';
import { AppLogger } from 'src/core/logging/logger.service';
import { IMailAdapter, MAIL_ADAPTER } from '../../interfaces/mail-adapter.interface';
import {
    INotificationStrategy,
    NotificationChannel,
    NotificationPayload,
} from '../../../notifications/interfaces/notification-strategy.interface';
import { paymentSuccessTemplate } from './templates/payment-success.template';
import { welcomeTemplate } from './templates/welcome.template';
import { subscriptionCreatedTemplate } from './templates/subscription-created.template';

@Injectable()
export class EmailStrategy implements INotificationStrategy {
    readonly channel: NotificationChannel = 'EMAIL';

    constructor(
        @Inject(MAIL_ADAPTER)
        private readonly mailAdapter: IMailAdapter,
        private readonly logger: AppLogger,
    ) { }

    async send(payload: NotificationPayload): Promise<void> {
        const template = this.getTemplate(payload);
        if (!template) {
            this.logger.warn(`No email template found, event: ${payload.event}`);
            return;
        }

        await this.mailAdapter.sendMail({
            to: payload.data.email,
            subject: template.subject,
            html: template.html,
        });

        this.logger.info('Email sent', {
            event: payload.event,
            to: payload.data.email,
        });
    }

    private getTemplate(payload: NotificationPayload) {
        switch (payload.event) {
            case 'PAYMENT_SUCCESS':
                return paymentSuccessTemplate(payload.data as any);
            case 'WELCOME':
                return welcomeTemplate(payload.data as any);
            // case 'SUBSCRIPTION_CANCELLED':
            //     return subscriptionCancelledTemplate(payload.data as any);
            case 'SUBSCRIPTION_CREATED':
                return subscriptionCreatedTemplate(payload.data as any);
            default:
                return null;
        }
    }
}