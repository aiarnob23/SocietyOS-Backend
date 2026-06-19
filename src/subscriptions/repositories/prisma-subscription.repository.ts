import { Injectable } from "@nestjs/common";
import { CreateSbuscriptionInput, CreateSubscriptionHistoryInput, ISubscriptionRepository } from "../ interfaces/subscription-repository.interface";
import { PrismaService } from "src/database/prisma/prisma.service";
import { Subscription, SubscriptionHistory, SubscriptionStatus } from "src/generated/prisma/client";


@Injectable()
export class PrismaSubscriptionRepository implements ISubscriptionRepository {
    constructor(private readonly prisma: PrismaService) { }

    createSubscription(data: CreateSbuscriptionInput): Promise<Subscription> {
        return this.prisma.subscription.create({ data });
    }

    findById(id: number): Promise<Subscription | null> {
        return this.prisma.subscription.findUnique({
            where: { id },
            include: {
                planVersion: { include: { plan: true } },
                invoices: true,
            }
        });
    }

    findActiveByUserId(userId: number): Promise<Subscription | null> {
        return this.prisma.subscription.findFirst({
            where: {
                userId,
                status: { in: [SubscriptionStatus.ACTIVE, SubscriptionStatus.PENDING] },
            },
            include: {
                planVersion: { include: { plan: true } },
            }
        })
    }

    findAllByUserId(userId: number): Promise<Subscription[]> {
        return this.prisma.subscription.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
            include: {
                planVersion: { include: { plan: true } },
                invoices: true,
            }
        });
    }

    updateStatus(id: number, status: SubscriptionStatus): Promise<Subscription> {
        return this.prisma.subscription.update({
            where: { id },
            data: { status },
        });
    }

    findDueForRenewal(today: Date): Promise<Subscription[]> {
        return this.prisma.subscription.findMany({
            where: {
                status: SubscriptionStatus.ACTIVE,
                nextBillingDate: { lte: today },
                cancelledAt: null,
            },
            include: {
                planVersion: true,
                user: true,
            }
        })
    }

    update(id: number, data: Partial<Subscription>): Promise<Subscription> {
        return this.prisma.subscription.update({
            where: { id },
            data,
        })
    }

    //History

    createSubscriptionHistory(data: CreateSubscriptionHistoryInput): Promise<SubscriptionHistory> {
        return this.prisma.subscriptionHistory.create({ data })
    }

    findHistoryBySubscriptionId(subscriptionId: number): Promise<SubscriptionHistory[]> {
        return this.prisma.subscriptionHistory.findMany({
            where: { subscriptionId },
            orderBy: { createdAt: 'desc' }
        })
    }
}