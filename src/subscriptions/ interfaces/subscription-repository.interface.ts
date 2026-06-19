import { Subscription, SubscriptionHistory } from "src/generated/prisma/client";
import { BillingInterval, SubscriptionChangeReason, SubscriptionStatus } from "src/generated/prisma/enums";

export const SUBSCRIPTION_REPOSITORY = Symbol('SUBSCRIPTION_REPOSITORY');

export interface CreateSbuscriptionInput {
    userId: number;
    planVersionId: number;
    billingInterval: BillingInterval;
    startDate: Date;
    status?: SubscriptionStatus;
}

export interface CreateSubscriptionHistoryInput {
    subscriptionId: number;
    fromStatus?: SubscriptionStatus;
    toStatus: SubscriptionStatus;
    fromPlanVersionId?: number;
    toPlanVersionId: number;
    changeReason: SubscriptionChangeReason;
    note?: string;
    proratedAmount?: number;
    effectiveDate: Date;
}

export interface ISubscriptionRepository {
    createSubscription(input: CreateSbuscriptionInput): Promise<Subscription>;
    findById(id: number): Promise<Subscription | null>;
    findActiveByUserId(userId: number): Promise<Subscription | null>;
    findAllByUserId(userId: number): Promise<Subscription[]>;
    updateStatus(id: number, status: SubscriptionStatus): Promise<Subscription>;
    findDueForRenewal(today: Date): Promise<Subscription[]>;
    update(id: number, data: Partial<Subscription>): Promise<Subscription>;

    createSubscriptionHistory(data: CreateSubscriptionHistoryInput): Promise<SubscriptionHistory>;
    findHistoryBySubscriptionId(subscriptionId: number): Promise<SubscriptionHistory[]>;
}