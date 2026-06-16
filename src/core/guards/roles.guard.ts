import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UserRole } from 'src/generated/prisma/client';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { JwtPayload } from 'src/modules/auth/token.service';
import { ErrorCodes } from '../exceptions/error-codes';
import { UnauthorizedException } from '../exceptions/unauthorized.exceptions';
import { ForbiddenException } from '../exceptions/forbidden.exception';

@Injectable()
export class RolesGuard implements CanActivate {
    constructor(private readonly reflector: Reflector) { }

    canActivate(context: ExecutionContext): boolean {
        const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(ROLES_KEY, [
            context.getHandler(),
            context.getClass(),
        ]);
        if (!requiredRoles?.length) return true;

        const user: JwtPayload = context.switchToHttp().getRequest().user;

        if (!user) {
            throw new UnauthorizedException(
                ErrorCodes.INVALID_TOKEN,
                'User not authenticated',
            );
        }

        if (!requiredRoles.includes(user.role as UserRole)) {
            throw new ForbiddenException(
                ErrorCodes.FORBIDDEN,
                `Access denied. Required role(s): ${requiredRoles.join(', ')}`,
            );
        }

        return true;
    }
}