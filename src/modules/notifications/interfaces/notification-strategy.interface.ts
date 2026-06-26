export type NotificationChannel = 'EMAIL' | 'SMS' | 'PUSH';

export type NotificationEvent =
    | 'USER_CREATED'
    | 'EMAIL_VERIFICATION'
    | 'PASSWORD_RESET'
    | 'PAYMENT_SUCCESS'
    | 'WELCOME'
    | 'SUBSCRIPTION_CREATED'
    | 'SUBSCRIPTION_CANCELLED';

export interface NotificationPayload {
    userId: number;
    event: NotificationEvent;
    data: Record<string, any>;
}

export interface INotificationStrategy {
    readonly channel: NotificationChannel;
    send(payload: NotificationPayload): Promise<void>;
}