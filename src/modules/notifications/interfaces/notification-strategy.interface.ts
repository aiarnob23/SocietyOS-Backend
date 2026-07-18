export type NotificationChannel = 'EMAIL' | 'SMS' | 'PUSH';

export type NotificationEvent =
    | 'USER_CREATED'
    | 'EMAIL_VERIFICATION'
    | 'PASSWORD_RESET'
    | 'PAYMENT_SUCCESS'
    | 'WELCOME'
    | 'SUBSCRIPTION_CREATED'
    | 'SUBSCRIPTION_CANCELLED'
    | 'NOTICE_PUBLISHED';

export interface NotificationPayload {
    userId: number;
    event: NotificationEvent | string;
    data: Record<string, any>;
}

export interface INotificationStrategy {
    readonly channel: NotificationChannel;
    send(payload: NotificationPayload): Promise<void>;
}