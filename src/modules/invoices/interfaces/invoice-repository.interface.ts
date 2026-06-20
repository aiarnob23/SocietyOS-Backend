import { Invoice, Prisma } from "src/generated/prisma/client";
import { BillingInterval, Currency, InvoiceStatus } from "src/generated/prisma/enums";

export const INVOICE_REPOSITORY = Symbol('INVOICE_REPOSITORY');

export interface CreateInvoiceInput {
    subscriptionId: number;
    planversionId: number;
    billinginterval: BillingInterval;
    invoiceNumber: string;
    currency: Currency;
    subtotal: Prisma.Decimal;
    discount?: Prisma.Decimal;
    tax?: Prisma.Decimal;
    total: Prisma.Decimal;
    status:InvoiceStatus;
    periodStart?: Date;
    periodEnd?: Date;
    dueDate?: Date;
    paidAt?: Date;
    voidedAt?: Date;
    voidReason?: string;
    notes?: string;
    metadata?: object;
}

export interface IInvoiceRepository {
    createInvoice(data: CreateInvoiceInput, tx?: Prisma.TransactionClient): Promise<Invoice>;
    findById(id: number): Promise<Invoice | null>;
    findBySubscriptionId(subscriptionId: number): Promise<Invoice[]>;
    findOpenBySubscriptionId(subscriptionId: number): Promise<Invoice | null>;
    updateStatus(id: number, status: InvoiceStatus, tx?: Prisma.TransactionClient): Promise<Invoice>;
    markAsPaid(id: number, tx?: Prisma.TransactionClient): Promise<Invoice>;
    generateInvoiceNumber(tx?: Prisma.TransactionClient): Promise<string>;
}