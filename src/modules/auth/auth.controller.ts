import { Body, Controller, HttpCode, HttpStatus, Post, Req, Res } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { Request, Response } from 'express';
import { LoginDto } from './dto/login.dto';
import { config } from 'src/core/config';
import { UnauthorizedException } from 'src/core/exceptions/unauthorized.exceptions';
import { ErrorCodes } from 'src/core/exceptions/error-codes';
import { AuthTokenResponse } from './types/auth-token-response.type';
import { Public } from 'src/core/decorators/public.decorator';
import { Roles } from 'src/core/decorators/roles.decorator';

const REFRESH_COOKIE_OPTIONS = {
    httpOnly: true,
    secure: true,
    sameSite: 'strict' as const,
    maxAge: Number(config.security.jwt.refreshExpiresIn) * 1000,
    path: '/',
}

@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) { }

    //Register
    @Public()
    @Post('register')
    @HttpCode(HttpStatus.CREATED)
    register(@Body() dto: RegisterDto) {
        return this.authService.register(dto);
    }

    //Login
    @Public()
    @Post('login')
    @HttpCode(HttpStatus.OK)
    async login(
        @Body() dto: LoginDto,
        @Res({ passthrough: true }) res: Response,
    ) {
        const result = await this.authService.login(dto);
        this.setRefreshCookie(res, result.data.refreshToken);
        return this.buildTokenResponse(result);
    }

    //Refresh token
    @Public()
    @Post('refresh-token')
    @HttpCode(HttpStatus.OK)
    async refresh(
        @Req() req: Request,
        @Res({ passthrough: true }) res: Response,
    ) {
        const refreshToken = req.cookies?.['refreshToken'];
        if (!refreshToken) {
            throw new UnauthorizedException(
                ErrorCodes.INVALID_TOKEN,
                'Refresh token is invalid or expired',
            )
        }
        const result = await this.authService.refresh(refreshToken);
        this.setRefreshCookie(res, result.data.refreshToken);
        return this.buildTokenResponse(result);
    }

    //Logout
    @Public()
    @Post('logout')
    @HttpCode(HttpStatus.OK)
    async logout(
        @Req() req: Request,
        @Res({ passthrough: true }) res: Response
    ) {
        const refreshToken = req.cookies?.['refreshToken'];
        const accessToken = req.headers['authorization']?.split(' ')[1];
        if (refreshToken || accessToken) {
            await this.authService.logout(refreshToken ?? '', accessToken ?? '');
        }
        res.clearCookie('refreshToken', REFRESH_COOKIE_OPTIONS);
        return {
            message: 'Logout successfully'
        }
    }

    //Set Refresh cookie
    private setRefreshCookie(res: Response, refreshToken: string): void {
        res.cookie(
            'refreshToken',
            refreshToken,
            REFRESH_COOKIE_OPTIONS
        );
    }

    //Token response
    private buildTokenResponse(result: AuthTokenResponse) {
        return {
            message: result.message,
            data: {
                userId: result.data.userId,
                accessToken: result.data.accessToken,
            }
        }
    }



}
