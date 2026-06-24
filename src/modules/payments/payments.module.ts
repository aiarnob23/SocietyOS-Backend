import { Module } from '@nestjs/common';
import { PaymentsController } from './payments.controller';
import { PaymentsService } from './payments.service';
import { PrismaPaymentRepository } from './repositories/prisma-payment.repository';
import { PAYMENT_REPOSITORY } from './interfaces/payment-repository.interface';
import { InvoicesModule } from '../invoices/invoices.module';
import { PrismaModule } from 'src/database/prisma/prisma.module';
import { StripeStrategy } from './strategies/stripe.strategy';
import { PaymentStrategyFactory } from './payment-strategy.factory';

@Module({
    imports: [PrismaModule, InvoicesModule],
    controllers: [PaymentsController],
    providers: [
        PaymentsService,
        PaymentStrategyFactory,
        StripeStrategy,
        PrismaPaymentRepository,
        {
            provide: PAYMENT_REPOSITORY,
            useClass: PrismaPaymentRepository,
        },
    ],
    exports: [PaymentsService],
})
export class PaymentsModule {}