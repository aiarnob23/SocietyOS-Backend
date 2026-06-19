import { Module } from '@nestjs/common';
import { SubscriptionsController } from './subscriptions.controller';
import { SubscriptionsService } from './subscriptions.service';
import { PrismaModule } from 'src/database/prisma/prisma.module';
import { PlansModule } from 'src/plans/plans.module';
import { SUBSCRIPTION_REPOSITORY } from './interfaces/subscription-repository.interface';
import { PrismaSubscriptionRepository } from './repositories/prisma-subscription.repository';

@Module({
  imports: [PrismaModule, PlansModule],
  controllers: [SubscriptionsController],
  providers: [
    SubscriptionsService,
    {
      provide: SUBSCRIPTION_REPOSITORY,
      useClass: PrismaSubscriptionRepository,
    },
  ],
  exports: [SubscriptionsService],
})
export class SubscriptionsModule { }
