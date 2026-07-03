import {
    Body, Controller, Delete, Get,
    HttpCode, HttpStatus, Param,
    ParseIntPipe, Patch, Post,
} from '@nestjs/common';
import { CommunitiesService } from './communities.service';
import { CreateCommunityDto } from './dto/create-community.dto';
import { UpdateCommunityDto } from './dto/update-community.dto';
import { CurrentUser } from 'src/core/decorators/current-user.decorator';
import { Roles } from 'src/core/decorators/roles.decorator';
import { Public } from 'src/core/decorators/public.decorator';
import { JwtPayload } from '../auth/token.service';
import { UserRole } from 'src/generated/prisma/client';

@Controller('communities')
export class CommunitiesController {
    constructor(private readonly communitiesService: CommunitiesService) {}

    // community create — COMMUNITY_ADMIN only
    @Post()
    @HttpCode(HttpStatus.CREATED)
    @Roles(UserRole.COMMUNITY_ADMIN)
    async createCommunity(
        @CurrentUser() user: JwtPayload,
        @Body() dto: CreateCommunityDto,
    ) {
        const community = await this.communitiesService.createCommunity(user, dto);
        return {
            message: 'Community created successfully',
            data: community,
        };
    }

    // my community
    @Get('my')
    @HttpCode(HttpStatus.OK)
    async getMyCommunity(@CurrentUser() user: JwtPayload) {
        const community = await this.communitiesService.getMyCommunity(user.userId);
        return {
            message: 'Community fetched successfully',
            data: community,
        };
    }

    // public — anyone
    @Public()
    @Get(':slug')
    @HttpCode(HttpStatus.OK)
    async getCommunityBySlug(@Param('slug') slug: string) {
        const community = await this.communitiesService.getCommunityBySlug(slug);
        return {
            message: 'Community fetched successfully',
            data: community,
        };
    }

    // update — COMMUNITY_ADMIN or SUPER_ADMIN
    @Patch(':id')
    @HttpCode(HttpStatus.OK)
    @Roles(UserRole.COMMUNITY_ADMIN, UserRole.SUPER_ADMIN)
    async updateCommunity(
        @CurrentUser() user: JwtPayload,
        @Param('id', ParseIntPipe) id: number,
        @Body() dto: UpdateCommunityDto,
    ) {
        const community = await this.communitiesService.updateCommunity(user, id, dto);
        return {
            message: 'Community updated successfully',
            data: community,
        };
    }

    // delete — SUPER_ADMIN only
    @Delete(':id')
    @HttpCode(HttpStatus.OK)
    @Roles(UserRole.SUPER_ADMIN)
    async deleteCommunity(
        @CurrentUser() user: JwtPayload,
        @Param('id', ParseIntPipe) id: number,
    ) {
        return this.communitiesService.deleteCommunity(user, id);
    }
}