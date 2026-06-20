import {
    Body, Controller, Get, HttpCode,
    HttpStatus, Param, ParseIntPipe, Post,
} from '@nestjs/common';
import { SubscriptionsService } from './subscriptions.service';
import { CreateSubscriptionDto } from './dto/create-subscription.dto';
import { CurrentUser } from 'src/core/decorators/current-user.decorator';
import { JwtPayload } from 'src/modules/auth/token.service';

@Controller('subscriptions')
export class SubscriptionsController {
    constructor(private readonly subscriptionsService: SubscriptionsService) {}
    // create new subscription
    @Post()
    @HttpCode(HttpStatus.CREATED)
    async createSubscription(
        @CurrentUser() user: JwtPayload,
        @Body() dto: CreateSubscriptionDto,
    ) {
        const subscription = await this.subscriptionsService.createSubscription(
            user.userId,
            dto,
        );
        return {
            message: 'Subscription created successfully',
            data: subscription,
        };
    }

    // my active subscription
    @Get('me')
    @HttpCode(HttpStatus.OK)
    async getMySubscription(@CurrentUser() user: JwtPayload) {
        const subscription = await this.subscriptionsService.getMyActiveSubscription(user.userId);
        return {
            message: 'Subscription fetched successfully',
            data: subscription,
        };
    }

    // subscription history by user id
    @Get('me/history')
    @HttpCode(HttpStatus.OK)
    async getMySubscriptionHistory(@CurrentUser() user: JwtPayload) {
        const history = await this.subscriptionsService.getMySubscriptionHistory(user.userId);
        return {
            message: 'Subscription history fetched successfully',
            data: history,
        };
    }

    // cancel subscription
    @Post(':id/cancel')
    @HttpCode(HttpStatus.OK)
    async cancelSubscription(
        @Param('id', ParseIntPipe) id: number,
        @CurrentUser() user: JwtPayload,
        @Body('note') note?: string,
    ) {
        const subscription = await this.subscriptionsService.cancelSubscription(
            id,
            user.userId,
            note,
        );
        return {
            message: 'Subscription cancelled successfully',
            data: subscription,
        };
    }
}