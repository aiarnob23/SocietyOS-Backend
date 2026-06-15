import { Module } from '@nestjs/common';
import { UsersModule } from 'src/modules/users/users.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { TokenService } from './token.service';
import { JwtModule } from '@nestjs/jwt';
import { SessionsModule } from '../sessions/sessions.module';

@Module({
    imports: [
        UsersModule,
        JwtModule.register({}),
        SessionsModule,
    ],
    controllers: [AuthController],
    providers: [
        AuthService,
        TokenService,
    ],
})
export class AuthModule {}
