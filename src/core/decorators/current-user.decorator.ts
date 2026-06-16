import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { JwtPayload } from 'src/modules/auth/token.service';

export const CurrentUser = createParamDecorator(
    (_: unknown, ctx: ExecutionContext): JwtPayload => {
        return ctx.switchToHttp().getRequest().user;
    },
);