import { Injectable } from '@nestjs/common';
import Stripe from 'stripe';
import { config } from 'src/core/config';
import { ConflictException } from 'src/core/exceptions/conflict.exceptions';
import { ErrorCodes } from 'src/core/exceptions/error-codes';
import {
    IPaymentStrategy,
    InitiatePaymentInput,
    InitiatePaymentResult,
    WebhookResult,
} from './payment-strategy.interface';

@Injectable()
export class StripeStrategy implements IPaymentStrategy {
    private readonly stripe: Stripe;

    constructor() {
        this.stripe = new Stripe(config.payment.stripe.secretKey as string, {
            apiVersion: '2026-05-27.dahlia',
        });
    }

    async initiate(input: InitiatePaymentInput): Promise<InitiatePaymentResult> {
        const paymentIntent = await this.stripe.paymentIntents.create(
            {
                amount: Math.round(input.amount.toNumber() * 100), // cents
                currency: input.currency.toLowerCase(),
                automatic_payment_methods: {
                    enabled: true,
                    allow_redirects: 'never',
                },
                metadata: {
                    invoiceId: input.invoiceId,
                    userId: input.userId,
                    idempotencyKey: input.idempotencyKey,
                },
            },
            { idempotencyKey: input.idempotencyKey },
        );

        return {
            transactionId: paymentIntent.id,
            clientSecret: paymentIntent.client_secret!,
            gatewayResponse: paymentIntent as object,
        };
    }

    async verifyWebhook(rawBody: Buffer, signature: string): Promise<WebhookResult> {
        let event: Stripe.Event;

        try {
            event = this.stripe.webhooks.constructEvent(
                rawBody,
                signature,
                config.payment.stripe.webhookSecret,
            );
        } catch (err: any) {
            throw new ConflictException(
                ErrorCodes.CONFLICT,
                'Invalid webhook signature',
            );
        }

        if(!event.type.startsWith('payment_intent')) {
            return {status: 'IGNORED'} as any;
        }

        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        const { invoiceId, userId, idempotencyKey } = paymentIntent.metadata;

        if (event.type === 'payment_intent.succeeded') {
            return {
                transactionId: paymentIntent.id,
                idempotencyKey,
                invoiceId: Number(invoiceId),
                userId: Number(userId),
                status: 'SUCCESS',
            };
        }

        return {
            transactionId: paymentIntent.id,
            idempotencyKey,
            invoiceId: Number(invoiceId),
            userId: Number(userId),
            status: 'FAILED',
            failureReason: paymentIntent.last_payment_error?.message,
        };
    }
}