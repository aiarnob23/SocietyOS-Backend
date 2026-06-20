import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/database/prisma/prisma.service';
import { Invoice, InvoiceStatus, Prisma } from 'src/generated/prisma/client';
import {
    CreateInvoiceInput,
    IInvoiceRepository,
} from '../interfaces/invoice-repository.interface';

@Injectable()
export class PrismaInvoiceRepository implements IInvoiceRepository {
    constructor(private readonly prisma: PrismaService) { }

    private get client() {
        return this.prisma;
    }

    //create invoice 
    async createInvoice(data: CreateInvoiceInput, tx?: Prisma.TransactionClient): Promise<Invoice> {
        const db = tx ?? this.client;
        const invoiceNumber = await this.generateInvoiceNumber(tx);
        return db.invoice.create({
            data: {
                subscriptionId: data.subscriptionId,
                planVersionId: data.planversionId,
                invoiceNumber,
                status: InvoiceStatus.OPEN,
                billingInterval: data.billinginterval,
                currency: data.currency,
                subtotal: data.subtotal,
                discount: data.discount ?? 0,
                tax: data.tax ?? 0,
                total: data.total,
                periodStart: data.periodStart,
                periodEnd: data.periodEnd,
                dueDate: data.dueDate ?? null,
                notes: data.notes ?? null,
                metadata: data.metadata ?? {},
            }
        })
    }
    //find invoice by id
    findById(id: number): Promise<Invoice | null> {
        return this.client.invoice.findUnique({
            where: { id },
            include: { subscription: true, planVersion: true }
        })
    }
    //find invoice by subscription id
    findBySubscriptionId(subscriptionId: number): Promise<Invoice[]> {
        return this.client.invoice.findMany({
            where: { subscriptionId },
            include: { subscription: true, planVersion: true },
            orderBy: {createdAt: 'desc'},
        })
    }
    //find open invoice by subscription id
    findOpenBySubscriptionId(subscriptionId: number): Promise<Invoice | null> {
        return this.client.invoice.findFirst({
            where: { subscriptionId, status: InvoiceStatus.OPEN },
            include: { subscription: true, planVersion: true }
        })
    }
    //update invoice status
    updateStatus(id: number, status: InvoiceStatus, tx?: Prisma.TransactionClient): Promise<Invoice> {
        const db = tx ?? this.client;
        return db.invoice.update({
            where: { id },
            data: { status }
        })
    }
    //mark invoice as paid
    markAsPaid(id: number, tx?: Prisma.TransactionClient): Promise<Invoice> {
        const db = tx ?? this.client;
        return db.invoice.update({
            where: { id },
            data: { status: InvoiceStatus.PAID, paidAt: new Date() }
        })
    }

    //generate Invoice number
    private async generateInvoiceNumber(tx?: Prisma.TransactionClient): Promise<string> {
        const db = tx ?? this.client;
        const count = await db.invoice.count();
        const date = new Date();
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `INV-${year}${month}${day}-${String(count + 1).padStart(5, '0')}`;
    }
}