import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/database/prisma/prisma.service';
import { Payment, PaymentStatus, Prisma } from 'src/generated/prisma/client';
import {
    CreatePaymentInput,
    IPaymentRepository,
} from '../interfaces/payment-repository.interface';

@Injectable()
export class PrismaPaymentRepository implements IPaymentRepository {
    constructor(private readonly prisma: PrismaService) { }

    create(data: CreatePaymentInput, tx?: Prisma.TransactionClient): Promise<Payment> {
        const db = tx ?? this.prisma;
        return db.payment.create({
            data: {
                subscriptionId: data.subscriptionId,
                invoiceId: data.invoiceId,
                amount: data.amount,
                currency: data.currency,
                paymentMethod: data.paymentMethod,
                idempotencyKey: data.idempotencyKey,
                transactionId: data.transactionId,
                status: PaymentStatus.PENDING,
                ipAddress: data.ipAddress,
                userAgent: data.userAgent,
            },
        });
    }

    findByIdempotencyKey(key: string): Promise<Payment | null> {
        return this.prisma.payment.findUnique({
            where: { idempotencyKey: key },
        });
    }

    findByTransactionId(transactionId: string): Promise<Payment | null> {
        return this.prisma.payment.findUnique({
            where: { transactionId },
        });
    }

    findByInvoiceId(invoiceId: number): Promise<Payment[]> {
        return this.prisma.payment.findMany({
            where: { invoiceId },
            orderBy: { createdAt: 'desc' },
        });
    }

    updateStatus(
        id: number,
        status: PaymentStatus,
        data?: Prisma.PaymentUpdateInput,
        tx?: Prisma.TransactionClient,
    ): Promise<Payment> {
        const db = tx ?? this.prisma;
        return db.payment.update({
            where: { id },
            data: {
                status,
                ...data,
            },
        });
    }
}