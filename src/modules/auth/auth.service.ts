import { Inject, Injectable } from '@nestjs/common';
import { UsersService } from 'src/modules/users/users.service';
import { RegisterDto } from './dto/register.dto';
import { ConflictException } from 'src/core/exceptions/conflict.exceptions';
import { ErrorCodes } from 'src/core/exceptions/error-codes';
import { LoginDto } from './dto/login.dto';
import { NotFoundException } from 'src/core/exceptions/not-found.exceptions';
import { UnauthorizedException } from 'src/core/exceptions/unauthorized.exceptions';
import { TokenService } from './token.service';
import { config } from 'src/core/config';
import { SessionService } from '../sessions/sessions.service';
import { RequestContext } from 'src/core/context/request/request-context';
import { EncryptionService } from 'src/core/security/encryption/encryption.service';
import { AppLogger } from 'src/core/logging/logger.service';
import { REDIS_CLIENT } from 'src/core/redis/redis.constant';
import Redis from 'ioredis';

@Injectable()
export class AuthService {
    constructor(
        @Inject(REDIS_CLIENT) private readonly redis: Redis,
        private readonly logger: AppLogger,
        private readonly usersService: UsersService,
        private readonly encryptionService: EncryptionService,
        private readonly tokenService: TokenService,
        private readonly sessionService: SessionService,
    ) { }

    //  REGISTER
    async register(dto: RegisterDto) {
        //Check if email already exists
        const existingUser = await this.usersService.findByEmail(dto.email);
        if (existingUser) {
            throw new ConflictException(
                ErrorCodes.EMAIL_ALREADY_EXISTS,
                'This email is already registered',
            )
        }
        //hash password
        const hashedPassword = await this.hashPassword(dto.password);
        //create user
        const user = await this.usersService.createUser({
            email: dto.email,
            phone: dto.phone,
            firstName: dto.firstName,
            lastName: dto.lastName,
            passwordHash: hashedPassword,
            avatarUrl: dto.avatarUrl,
            communityId: dto.communityId,
            emailVerifiedAt: null,
        });

        //send otp for email and phone verification

        //return response
        return {
            message: 'User created successfully',
            data: {
                userId: user.id,
                requiredVerification: true,
            }
        }
    }

    //  LOGIN
    async login(dto: LoginDto) {
        this.logger.info('Login attempt', { email: dto.email });
        //Check if user exists
        const existingUser = await this.usersService.findByEmail(dto.email);
        if (!existingUser) {
            throw new NotFoundException(
                ErrorCodes.USER_NOT_FOUND,
                'User not found',
            )
        }
        //check if email is verified
        if (existingUser.emailVerifiedAt === null) {
            throw new UnauthorizedException(
                ErrorCodes.EMAIL_NOT_VERIFIED,
                'Please verify your email before logging in',
            )
        }
        //verify password
        const isValidPassword = await this.verifyPassword(dto.password, existingUser.passwordHash);
        if (!isValidPassword) {
            throw new UnauthorizedException(
                ErrorCodes.INVALID_CREDENTIALS,
                'Invalid Email or Password',
            )
        }
        //create access and refresh tokens
        const { accessToken, refreshToken } = this.tokenService.generateToken(existingUser.id, existingUser.email, existingUser.role);
        //create session
        const ctx = RequestContext.get();
        await this.sessionService.createSession(
            existingUser.id,
            refreshToken,
            {
                ipAddress: ctx?.ipAddress,
                userAgent: ctx?.userAgent,
                expiresAt: new Date(Date.now() + Number(config.security.jwt.refreshExpiresIn) * 1000),
            }
        );
        return {
            message: 'User logged in successfully',
            data: {
                userId: existingUser.id,
                accessToken,
                refreshToken
            }
        }
    }

    // REFRESH TOKEN
    async refresh(refreshTokenFromCookie: string) {
        const paylod = this.tokenService.verifyRefreshToken(refreshTokenFromCookie);
        //check if user exists
        const user = await this.usersService.findByEmail(paylod.email);
        if (!user) {
            throw new UnauthorizedException(
                ErrorCodes.INVALID_TOKEN,
                'Refresh token is invalid or expired',
            )
        }
        //check if session exists
        const session = await this.sessionService.findValidSession(paylod.userId, refreshTokenFromCookie);
        if (!session) {
            throw new UnauthorizedException(
                ErrorCodes.INVALID_TOKEN,
                'Refresh token is invalid or expired',
            )
        }
        //create access token
        const { accessToken, refreshToken } = this.tokenService.generateToken(paylod.userId, paylod.email, paylod.role);
        //rotate refresh token
        await this.sessionService.rotateRefreshToken(session.id, refreshToken);
        return {
            message: 'Token refreshed successfully',
            data: {
                userId: user.id,
                accessToken,
                refreshToken
            }
        }
    }

    // LOGOUT
    async logout(refreshToken: string, accessToken: string) {
        try {
            const payload = this.tokenService.verifyRefreshToken(refreshToken);
            this.logger.info('Logout attempt', { userId: payload.userId });
            if (payload) {
                const session = await this.sessionService.findValidSession(payload.userId, refreshToken);
                if (session) {
                    await this.sessionService.revokeSession(session.id);
                    this.logger.info('Session revoked successfully', { userId: payload.userId, sessionId: session.id });
                }
            }
            if (accessToken) {
                await this.redis.setex(
                    `blacklist-token:${accessToken}`,
                    config.security.jwt.acessExpiresIn,
                    '1',
                );
            }
            this.logger.info('Logout successfully', { userId: payload.userId });
            return {
                message: 'Logout successfully'
            }
        } catch (error) {
            this.logger.error('Error revoking session', error as string);
        }
    }

    // HASH PASSWORD
    private async hashPassword(password: string): Promise<string> {
        return await this.encryptionService.hash(password);
    }

    // VERIFY PASSWORD
    private async verifyPassword(plainPassword: string, hashedPassword: string): Promise<boolean> {
        return await this.encryptionService.verify(hashedPassword, plainPassword);
    }
}
