import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './modules/users/users.module';
import { AuthModule } from './modules/auth/auth.module';
import { SessionsModule } from './modules/sessions/sessions.module';
import { RequestContextModule } from './core/context/request/request-context.module';

@Module({
  imports: [RequestContextModule, UsersModule, AuthModule, SessionsModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
