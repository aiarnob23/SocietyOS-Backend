import { Inject, Injectable } from '@nestjs/common';
import { createHash } from 'crypto';
import {
    InvoiceStatus,
    PaymentMethod,
    PaymentStatus,
    SubscriptionChangeReason,
    SubscriptionStatus,
    UserRole,
} from 'src/generated/prisma/client';
import { PrismaService } from 'src/database/prisma/prisma.service';
import { AppLogger } from 'src/core/logging/logger.service';
import { RequestContext } from 'src/core/context/request/request-context';
import { ConflictException } from 'src/core/exceptions/conflict.exceptions';
import { ErrorCodes } from 'src/core/exceptions/error-codes';
import { PaymentStrategyFactory } from './payment-strategy.factory';
import {
    IPaymentRepository,
    PAYMENT_REPOSITORY,
} from './interfaces/payment-repository.interface';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { InvoicesService } from '../invoices/invoices.service';

@Injectable()
export class PaymentsService {
    constructor(
        @Inject(PAYMENT_REPOSITORY)
        private readonly paymentRepository: IPaymentRepository,
        private readonly invoicesService: InvoicesService,
        private readonly strategyFactory: PaymentStrategyFactory,
        private readonly prisma: PrismaService,
        private readonly logger: AppLogger,
    ) { }

    async initiatePayment(userId: number, dto: CreatePaymentDto) {
        const invoice = await this.invoicesService.getInvoiceById(dto.invoiceId);

        if (invoice.status !== InvoiceStatus.OPEN) {
            throw new ConflictException(
                ErrorCodes.CONFLICT,
                'Invoice is not open for payment',
            );
        }

        const idempotencyKey = this.generateIdempotencyKey(dto.invoiceId, userId);

        // already paid check
        const existing = await this.paymentRepository.findByIdempotencyKey(idempotencyKey);
        if (existing?.status === PaymentStatus.SUCCESS) {
            throw new ConflictException(ErrorCodes.CONFLICT, 'Invoice already paid');
        }

        // strategy select করো
        const strategy = this.strategyFactory.getStrategy(dto.paymentMethod);

        const result = await strategy.initiate({
            invoiceId: dto.invoiceId,
            userId,
            amount: invoice.total,
            currency: invoice.currency,
            idempotencyKey,
        });

        this.logger.info('Payment initiated', {
            invoiceId: dto.invoiceId,
            userId,
            method: dto.paymentMethod,
            transactionId: result.transactionId,
        });

        return {
            transactionId: result.transactionId,
            clientSecret: result.clientSecret,       // Stripe
            redirectUrl: result.redirectUrl,          // bKash/Nagad
            amount: invoice.total,
            currency: invoice.currency,
        };
    }

    async handleWebhook(rawBody: Buffer, signature: string, paymentMethod: PaymentMethod) {
        const strategy = this.strategyFactory.getStrategy(paymentMethod);
        const result = await strategy.verifyWebhook(rawBody, signature);
        if (result.status === 'IGNORED') return;

        if (result.status === 'SUCCESS') {
            await this.processSuccessfulPayment(result);
        } else {
            await this.processFailedPayment(result);
        }
    }

    private async processSuccessfulPayment(result: any) {
        // idempotency check
        const existing = await this.paymentRepository.findByIdempotencyKey(result.idempotencyKey);
        if (existing?.status === PaymentStatus.SUCCESS) {
            this.logger.warn(`Duplicate webhook received idempotencyKey: ${result.idempotencyKey}`);
            return;
        }

        const invoice = await this.invoicesService.getInvoiceById(result.invoiceId);
        const ctx = RequestContext.get();

        await this.prisma.$transaction(async (tx) => {
            //  payment create/update
            if (existing) {
                await this.paymentRepository.updateStatus(
                    existing.id,
                    PaymentStatus.SUCCESS,
                    { paidAt: new Date(), gatewayResponse: result.gatewayResponse },
                    tx,
                );
            } else {
                await this.paymentRepository.create({
                    subscriptionId: invoice.subscriptionId,
                    invoiceId: result.invoiceId,
                    amount: invoice.total,
                    currency: invoice.currency,
                    paymentMethod: PaymentMethod.CARD,
                    idempotencyKey: result.idempotencyKey,
                    transactionId: result.transactionId,
                    status: PaymentStatus.SUCCESS,
                    ipAddress: ctx?.ipAddress,
                    userAgent: ctx?.userAgent,
                }, tx);
            }

            //  invoice → PAID
            await tx.invoice.update({
                where: { id: result.invoiceId },
                data: { status: InvoiceStatus.PAID, paidAt: new Date() },
            });

            //  subscription → ACTIVE
            const now = new Date();
            const subscription = await tx.subscription.findUnique({
                where: { id: invoice.subscriptionId },
                include: { planVersion: true },
            });

            const periodEnd = this.calculatePeriodEnd(
                now,
                subscription!.planVersion.billingInterval,
            );

            await tx.subscription.update({
                where: { id: invoice.subscriptionId },
                data: {
                    status: SubscriptionStatus.ACTIVE,
                    currentPeriodStart: now,
                    currentPeriodEnd: periodEnd,
                    nextBillingDate: periodEnd,
                },
            });

            // update user role
            await tx.user.update({
                where: { id: subscription?.userId },
                data: { role: UserRole.COMMUNITY_ADMIN },
            })


            //  history
            await tx.subscriptionHistory.create({
                data: {
                    subscriptionId: invoice.subscriptionId,
                    fromStatus: SubscriptionStatus.PENDING,
                    toStatus: SubscriptionStatus.ACTIVE,
                    changeReason: SubscriptionChangeReason.PAYMENT_SUCCEEDED,
                    effectiveDate: now,
                },
            });
        });

        this.logger.info('Payment successful', {
            invoiceId: result.invoiceId,
            transactionId: result.transactionId,
        });
    }

    private async processFailedPayment(result: any) {
        const existing = await this.paymentRepository.findByIdempotencyKey(result.idempotencyKey);
        if (existing) {
            await this.paymentRepository.updateStatus(
                existing.id,
                PaymentStatus.FAILED,
                { failureReason: result.failureReason },
            );
        }

        this.logger.warn(`Payment failed idempotencyKey: ${result.idempotencyKey}, reason: ${result.failureReason}, transactionId: ${result.transactionId}`);
    }

    private generateIdempotencyKey(invoiceId: number, userId: number): string {
        return createHash('sha256')
            .update(`invoice_${invoiceId}_user_${userId}`)
            .digest('hex');
    }

    private calculatePeriodEnd(from: Date, billingInterval: string): Date {
        const end = new Date(from);
        if (billingInterval === 'MONTHLY') {
            end.setMonth(end.getMonth() + 1);
        } else {
            end.setFullYear(end.getFullYear() + 1);
        }
        return end;
    }
}