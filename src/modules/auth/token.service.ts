import { Injectable } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { config } from "src/core/config";
import { ErrorCodes } from "src/core/exceptions/error-codes";
import { UnauthorizedException } from "src/core/exceptions/unauthorized.exceptions";

export interface JwtPayload {
    userId: number,
    email: string,
    role: string
}

export interface TokenPayload {
    accessToken: string;
    refreshToken: string;
}

@Injectable()
export class TokenService {
    constructor(
        private readonly jwtService: JwtService,
    ) { }

    generateToken(userId: number, email: string, role: string): TokenPayload {
        const payload = { userId,email, role };
        const accessToken = this.jwtService.sign(payload, {
            secret: config.security.jwt.secret,
            expiresIn: config.security.jwt.acessExpiresIn as any,
        })

        const refreshToken = this.jwtService.sign(
            payload,
            {
                secret: config.security.jwt.secret,
                expiresIn: config.security.jwt.refreshExpiresIn as any,
            }
        );
        return { accessToken, refreshToken };
    }

    verifyAccessToken(token: string): JwtPayload {
        try {
            return this.jwtService.verify(token, {
                secret: config.security.jwt.secret,
            });
        } catch {
            throw new UnauthorizedException(
                ErrorCodes.INVALID_TOKEN,
                'Access token is invalid or expired',
            )
        }
    }

    verifyRefreshToken(token: string): JwtPayload {
        try {
            return this.jwtService.verify(token, {
                secret: config.security.jwt.secret,
            });
        } catch {
            throw new UnauthorizedException(
                ErrorCodes.INVALID_TOKEN,
                'Refresh token is invalid or expired',
            )
        }
    }
}