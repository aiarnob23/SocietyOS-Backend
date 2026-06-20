import { Inject, Injectable } from '@nestjs/common';
import { IInvoiceRepository, INVOICE_REPOSITORY } from './interfaces/invoice-repository.interface';
import { AppLogger } from 'src/core/logging/logger.service';
import { BillingInterval, Currency, InvoiceStatus } from 'src/generated/prisma/enums';
import { Prisma } from 'src/generated/prisma/client';
import { NotFoundException } from 'src/core/exceptions/not-found.exceptions';
import { ErrorCodes } from 'src/core/exceptions/error-codes';

@Injectable()
export class InvoicesService {
    constructor(
        @Inject(INVOICE_REPOSITORY)
        private readonly invoiceRepository: IInvoiceRepository,
        private readonly logger: AppLogger,
    ) { }

    // create invoice
    async createInvoice(
        data: {
            subscriptionId: number;
            planversionId: number;
            billinginterval: BillingInterval;
            currency: Currency;
            subtotal: Prisma.Decimal;
            total: Prisma.Decimal;
            dueDate?: Date;
            notes?: string;
            metadata?: object;
        },
        tx?: Prisma.TransactionClient,
    ) {
        const invoiceNumber = await this.invoiceRepository.generateInvoiceNumber(tx);
        this.logger.info('Creating invoice', { invoiceNumber: invoiceNumber, subscriptionId: data.subscriptionId, planversionId: data.planversionId });
        const invoice = await this.invoiceRepository.createInvoice({
            ...data,
            invoiceNumber,
            status: InvoiceStatus.OPEN,
        }, tx);
        this.logger.info('Invoice created', { invoiceId: invoice.id, invoiceNumber: invoiceNumber, subscriptionId: data.subscriptionId, planversionId: data.planversionId });
        return invoice;
    }

    //get invoice by id
    async getInvoiceById(id: number) {
        const invoice = await this.invoiceRepository.findById(id);
        if (!invoice) {
            throw new NotFoundException(
                ErrorCodes.NOT_FOUND,
                'Invoice not found',
            )
        }
        return invoice;
    }

    //get invoice by subscription id
    async getInvoiceBySubscriptionId(subscriptionId: number) {
        const invoice = await this.invoiceRepository.findBySubscriptionId(subscriptionId);
        if (!invoice) {
            throw new NotFoundException(
                ErrorCodes.NOT_FOUND,
                'Invoice not found',
            )
        }
        return invoice;
    }
}
