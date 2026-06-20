import { Inject, Injectable } from '@nestjs/common';
import { ISubscriptionRepository, SUBSCRIPTION_REPOSITORY } from './interfaces/subscription-repository.interface';
import { PlansService } from 'src/modules/plans/plans.service';
import { AppLogger } from 'src/core/logging/logger.service';
import { CreateSubscriptionDto } from './dto/create-subscription.dto';
import { ConflictException } from 'src/core/exceptions/conflict.exceptions';
import { ErrorCodes } from 'src/core/exceptions/error-codes';
import { NotFoundException } from 'src/core/exceptions/not-found.exceptions';
import { SubscriptionChangeReason, SubscriptionStatus } from 'src/generated/prisma/enums';
import { PrismaService } from 'src/database/prisma/prisma.service';
import { InvoicesService } from 'src/invoices/invoices.service';

@Injectable()
export class SubscriptionsService {
    constructor(
        @Inject(SUBSCRIPTION_REPOSITORY)
        private readonly subscriptionRepository: ISubscriptionRepository,
        private readonly prisma: PrismaService,
        private readonly plansService: PlansService,
        private readonly invoiceService: InvoicesService,
        private readonly logger: AppLogger,
    ) { }

    // create new subscription
    async createSubscription(userId: number, dto: CreateSubscriptionDto) {
        //check active subscription
        const existing = await this.subscriptionRepository.findActiveByUserId(userId);
        if (existing) {
            throw new ConflictException(
                ErrorCodes.CONFLICT,
                'User already has an active subscription',
            )
        }
        //find plan and active version
        const plan = await this.plansService.getPlanByType(dto.planType);
        const activeVersion = plan.planVersions[0];
        if (!activeVersion) {
            throw new NotFoundException(
                ErrorCodes.NOT_FOUND,
                'No active version found for this plan',
            );
        }

        const result = await this.prisma.$transaction(async (tx) => {
            //create subscription
            const subscription = await tx.subscription.create({
                data: {
                    userId,
                    planVersionId: activeVersion.id,
                    billingInterval: dto.billingInterval,
                    status: SubscriptionStatus.PENDING,
                    startDate: new Date(),
                }
            })
            this.logger.info('Subscription created', {
                subscriptionId: subscription.id,
                userId,
                planType: dto.planType,
            });

            //create subscription history
            const subscriptionHistory = await tx.subscriptionHistory.create({
                data: {
                    subscriptionId: subscription.id,
                    toStatus: SubscriptionStatus.PENDING,
                    toPlanVersionId: activeVersion.id,
                    changeReason: SubscriptionChangeReason.NEW_SUBSCRIPTION,
                    note: 'New subscription created',
                    effectiveDate: new Date(),
                }
            })
            this.logger.info('Subscription history created', {
                subscriptionHistoryId: subscriptionHistory.id,
                subscriptionId: subscription.id,
                toStatus: SubscriptionStatus.PENDING,
                toPlanVersionId: activeVersion.id,
                changeReason: SubscriptionChangeReason.NEW_SUBSCRIPTION,
                effectiveDate: new Date(),
            })

            //create invoice
            const invoice = await this.invoiceService.createInvoice({
                subscriptionId: subscription.id,
                planversionId: activeVersion.id,
                billinginterval: dto.billingInterval,
                currency: activeVersion.currency,
                subtotal: activeVersion.price,
                total: activeVersion.price,
                notes: 'New subscription created',
                metadata: {},
            }, tx);
            return { subscription, subscriptionHistory, invoice };
        });

        this.logger.info('Subscription creted with invoice', {
            subscriptionId: result.subscription.id,
            invoiceId: result.invoice.id,
            userId: userId,
        })

        return {
            subscriptionId: result.subscription.id,
            invoiceId: result.invoice.id,
            amount: result.invoice.total,
            currency: result.invoice.currency,
            subscriptionHistory: result.subscriptionHistory.id,
        };
    }

    //my active subscription
    async getMyActiveSubscription(userId: number) {
        const subscription = await this.subscriptionRepository.findActiveByUserId(userId);
        if (!subscription) {
            throw new NotFoundException(
                ErrorCodes.NOT_FOUND,
                'No active subscription found for this user',
            );
        }
        return subscription;
    }

    //subscription history by user
    async getMySubscriptionHistory(userId: number) {
        return this.subscriptionRepository.findAllByUserId(userId);
    }

    //get subscription by id
    async getSubscriptionById(id: number) {
        const subscription = await this.subscriptionRepository.findById(id);
        if (!subscription) {
            throw new NotFoundException(
                ErrorCodes.NOT_FOUND,
                'Subscription not found',
            );
        }
        return subscription;
    }

    //subscription activate - after payment success
    async activateSubscription(subscriptionId: number) {
        const subscription = await this.getSubscriptionById(subscriptionId);
        //calculate billing period
        const now = new Date();
        const periodEnd = this.calculatePeriodEnd(now, subscription.billingInterval);
        //update subscription satus
        const activated = await this.subscriptionRepository.update(subscriptionId, {
            status: SubscriptionStatus.ACTIVE,
            currentPeriodStart: now,
            currentPeriodEnd: periodEnd,
            nextBillingDate: periodEnd,
        });
        //update subscription history
        await this.subscriptionRepository.createSubscriptionHistory({
            subscriptionId,
            toPlanVersionId: subscription.planVersionId,
            fromStatus: SubscriptionStatus.PENDING,
            toStatus: SubscriptionStatus.ACTIVE,
            changeReason: SubscriptionChangeReason.PAYMENT_SUCCEEDED,
            effectiveDate: now,
        });
        this.logger.info('Subscription activated', {
            subscriptionId,
            planVersionId: subscription.planVersionId,
            fromStatus: SubscriptionStatus.PENDING,
            toStatus: SubscriptionStatus.ACTIVE,
            changeReason: SubscriptionChangeReason.PAYMENT_SUCCEEDED,
            effectiveDate: now,
            nextBillingDate: activated.nextBillingDate,
        })
        return activated;
    }

    //cancel subscription
    async cancelSubscription(subscriptionId: number, userId: number, note?: string) {
        const subscription = await this.getSubscriptionById(subscriptionId);
        if (!subscription) {
            throw new NotFoundException(
                ErrorCodes.NOT_FOUND,
                'Subscription not found',
            );
        }
        if (subscription.status != SubscriptionStatus.ACTIVE) {
            throw new ConflictException(
                ErrorCodes.CONFLICT,
                'Subscription is not active',
            );
        }
        const cancelled = await this.subscriptionRepository.update(subscriptionId, {
            cancelledAt: new Date(),
            cancellationNote: note,
            status: SubscriptionStatus.CANCELLED,
        })
        await this.subscriptionRepository.createSubscriptionHistory({
            subscriptionId,
            fromStatus: SubscriptionStatus.ACTIVE,
            toStatus: SubscriptionStatus.CANCELLED,
            changeReason: SubscriptionChangeReason.CANCELLED,
            note,
            effectiveDate: new Date(),
        })
        this.logger.info('Subscription cancelled', { subscriptionId, userId, note });
        return cancelled;
    }


    //calculate billing period
    private calculatePeriodEnd(from: Date, billingInterval: string): Date {
        const end = new Date(from);
        if (billingInterval === "MONTHLY") {
            end.setMonth(end.getMonth() + 1);
        } else {
            end.setFullYear(end.getFullYear() + 1);
        }
        return end;
    }
}
