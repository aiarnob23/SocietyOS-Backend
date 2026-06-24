import {
    Body, Controller, Headers, HttpCode,
    HttpStatus, Post, RawBodyRequest, Req, Query,
} from '@nestjs/common';
import { Request } from 'express';
import { PaymentsService } from './payments.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { CurrentUser } from 'src/core/decorators/current-user.decorator';
import { Public } from 'src/core/decorators/public.decorator';
import { JwtPayload } from 'src/modules/auth/token.service';
import { PaymentMethod } from 'src/generated/prisma/client';

@Controller('payments')
export class PaymentsController {
    constructor(private readonly paymentsService: PaymentsService) {}

    @Post('initiate')
    @HttpCode(HttpStatus.OK)
    async initiatePayment(
        @CurrentUser() user: JwtPayload,
        @Body() dto: CreatePaymentDto,
    ) {
        const result = await this.paymentsService.initiatePayment(user.userId, dto);
        return {
            message: 'Payment initiated successfully',
            data: result,
        };
    }

    @Public()
    @Post('webhook')
    @HttpCode(HttpStatus.OK)
    async handleWebhook(
        @Req() req: RawBodyRequest<Request>,
        @Headers('stripe-signature') stripeSignature: string,
        @Query('method') method: PaymentMethod,
    ) {
        await this.paymentsService.handleWebhook(
            req.rawBody!,
            stripeSignature,
            method ?? PaymentMethod.CARD,
        );
        return { received: true };
    }
}