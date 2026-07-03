import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './modules/users/users.module';
import { AuthModule } from './modules/auth/auth.module';
import { SessionsModule } from './modules/sessions/sessions.module';
import { RequestContextModule } from './core/context/request/request-context.module';
import { APP_GUARD } from '@nestjs/core';
import { JwtAuthGuard } from './core/guards/jwt-auth.guard';
import { RolesGuard } from './core/guards/roles.guard';
import { AppLoggerModule } from './core/logging/logger.module';
import { RedisModule } from './core/redis/redis.module';
import { BullMQModule } from './core/queues/bullmq.module';
import { PlansModule } from './modules/plans/plans.module';
import { SubscriptionsModule } from './modules/subscriptions/subscriptions.module';
import { InvoicesModule } from './modules/invoices/invoices.module';
import { PrismaModule } from './database/prisma/prisma.module';
import { PaymentsModule } from './modules/payments/payments.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { CommunitiesModule } from './modules/communities/communities.module';
import { PropertiesModule } from './modules/properties/properties.module';
import { ServiceProviderModule } from './modules/service-providers/service-providers.module';

@Module({
  imports: [
    RedisModule,
    BullMQModule,
    AppLoggerModule,
    PrismaModule,
    RequestContextModule,
    UsersModule,
    AuthModule,
    SessionsModule,
    PlansModule,
    SubscriptionsModule,
    InvoicesModule,
    PaymentsModule,
    NotificationsModule,
    CommunitiesModule,
    PropertiesModule,
    ServiceProviderModule
  ],
  controllers: [AppController],
  providers: [
    AppService,
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_GUARD, useClass: RolesGuard },
  ],
})
export class AppModule { }
