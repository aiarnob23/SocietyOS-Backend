import { Injectable } from "@nestjs/common";
import { StripeStrategy } from "./strategies/stripe.strategy";
import { PaymentMethod } from "src/generated/prisma/enums";
import { NotFoundException } from "src/core/exceptions/not-found.exceptions";
import { ErrorCodes } from "src/core/exceptions/error-codes";


@Injectable()
export class PaymentStrategyFactory {
    constructor(
        private readonly stripeStrategy: StripeStrategy,
    ) { }

    getStrategy(method: PaymentMethod) {
        switch (method) {
            case PaymentMethod.CARD:
                return this.stripeStrategy;
            default:
                throw new NotFoundException(
                    ErrorCodes.NOT_FOUND,
                    `Payment method not supported: ${method}`,
                )
        }
    }
}