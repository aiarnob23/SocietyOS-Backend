import { Currency, Payment, PaymentMethod, PaymentStatus, Prisma } from "src/generated/prisma/client";

export const PAYMENT_REPOSITORY = Symbol('PAYMENT_REPOSITORY');

export interface CreatePaymentInput {
    subscriptionId: number;
    invoiceId: number;
    amount: Prisma.Decimal;
    currency: Currency;
    paymentMethod: PaymentMethod;
    idempotencyKey: string;
    transactionId: string;
    ipAddress?: string;
    userAgent?: string;
    metadata?: object;
}

export interface IPaymentRepository {
    create(data: CreatePaymentInput, tx?: Prisma.TransactionClient): Promise<Payment>;
    findByIdempotencyKey(key: string): Promise<Payment | null>;
    findByTransactionId(transactionId: string): Promise<Payment | null>;
    findByInvoiceId(invoiceId: number): Promise<Payment[]>;
    updateStatus(
        id: number,
        status: PaymentStatus,
        data?: Prisma.PaymentUpdateInput,
        tx?: Prisma.TransactionClient,
    ): Promise<Payment>;
}