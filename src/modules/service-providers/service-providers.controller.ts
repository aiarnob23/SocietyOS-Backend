// src/modules/service-provider/service-provider.controller.ts
import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Query } from '@nestjs/common';
import { ServiceProviderService } from './service-providers.service';
import { CurrentUser } from 'src/core/decorators/current-user.decorator';
import { JwtPayload } from '../auth/token.service';
import { CreateServiceProviderDto } from './dto/create-service-provider.dto';


@Controller('communities/:communityId/service-providers')
export class ServiceProviderController {
    constructor(private readonly service: ServiceProviderService) {}

    @Post()
    create(
        @Param('communityId', ParseIntPipe) communityId: number,
        @CurrentUser() user: JwtPayload,
        @Body() dto: CreateServiceProviderDto,
    ) {
        return this.service.create(communityId, user.userId, dto);
    }

    @Get()
    findAll(
        @Param('communityId', ParseIntPipe) communityId: number,
        @Query('category') category?: string,
    ) {
        return this.service.findByCommunity(communityId, category);
    }

    @Get(':id')
    findOne(@Param('id', ParseIntPipe) id: number) {
        return this.service.findById(id);
    }

    @Patch(':id')
    update(
        @Param('id', ParseIntPipe) id: number,
        @Body() dto: Partial<CreateServiceProviderDto>,
    ) {
        return this.service.update(id, dto);
    }

    @Delete(':id')
    remove(@Param('id', ParseIntPipe) id: number) {
        return this.service.remove(id);
    }
}