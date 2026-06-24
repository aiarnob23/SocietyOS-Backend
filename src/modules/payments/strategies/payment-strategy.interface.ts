import { Currency, Prisma } from "src/generated/prisma/client";

export interface InitiatePaymentInput {
    invoiceId: number;
    userId: number;
    amount: Prisma.Decimal;
    currency: Currency;
    idempotencyKey: string;
    metadata?: object;
}

export interface InitiatePaymentResult {
    transactionId: string;
    clientSecret?: string;
    redirectUrl?: string;
    gatewayResponse: object;
}

export interface WebhookResult {
    transactionId: string;
    idempotencyKey: string;
    invoiceId: number;
    userId: number;
    status: 'SUCCESS' | 'FAILED' | 'IGNORED';
    failureReason?: string;
}

export interface IPaymentStrategy {
    initiate(input: InitiatePaymentInput): Promise<InitiatePaymentResult>;
    verifyWebhook(rawBody: Buffer, signature: string): Promise<WebhookResult>;
}