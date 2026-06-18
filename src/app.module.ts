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

@Module({
  imports: [RedisModule, BullMQModule, AppLoggerModule ,RequestContextModule, UsersModule, AuthModule, SessionsModule],
  controllers: [AppController],
  providers: [
    AppService,
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_GUARD, useClass: RolesGuard },
  ],
})
export class AppModule { }
