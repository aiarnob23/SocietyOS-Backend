import { Module } from '@nestjs/common';
import { NotificationRegistry } from './notifications.registry';
import { NotificationsService } from './notification.service';
import { NotificationQueue } from './notification.queue';
import { NotificationProcessor } from './workers/notification.processor';
import { EmailStrategy } from './strategies/email/email.strategy';
import { NodemailerMailtrapAdapter } from './strategies/email/adapters/nodemailer-mailtrap.adapter';
import { MAIL_ADAPTER } from './interfaces/mail-adapter.interface';


@Module({
    providers: [
        NotificationsService,
        NotificationRegistry,
        NotificationQueue,
        NotificationProcessor,
        EmailStrategy,
        NodemailerMailtrapAdapter,
        {
            provide: MAIL_ADAPTER,
            useClass: NodemailerMailtrapAdapter,
        },
    ],
    exports: [NotificationsService],
})
export class NotificationsModule { }