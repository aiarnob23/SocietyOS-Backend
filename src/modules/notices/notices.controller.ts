import {
    Body, Controller, Delete, Get,
    HttpCode, HttpStatus, Param,
    ParseIntPipe, Patch, Post,
} from '@nestjs/common';
import { NoticesService } from './notices.service';
import { CreateNoticeDto } from './dto/create-notice.dto';
import { UpdateNoticeDto } from './dto/update-notice.dto';
import { CurrentUser } from 'src/core/decorators/current-user.decorator';
import { Roles } from 'src/core/decorators/roles.decorator';
import { JwtPayload } from '../auth/token.service';
import { UserRole } from 'src/generated/prisma/client';

@Controller('notices')
export class NoticesController {
    constructor(private readonly noticesService: NoticesService) {}

    // Create notice
    @Post()
    @HttpCode(HttpStatus.CREATED)
    @Roles(UserRole.COMMUNITY_ADMIN, UserRole.SUPER_ADMIN)
    async createNotice(
        @CurrentUser() user: JwtPayload,
        @Body() dto: CreateNoticeDto,
    ) {
        const notice = await this.noticesService.createNotice(user, dto);
        return { message: 'Notice created successfully', data: notice };
    }

    // Get my notices
    @Get('my')
    @HttpCode(HttpStatus.OK)
    async getMyNotices(@CurrentUser() user: JwtPayload) {
        const notices = await this.noticesService.getMyNotices(user);
        return { message: 'Notices fetched successfully', data: notices };
    }

    // Get all community notices - Admin only
    @Get('community')
    @HttpCode(HttpStatus.OK)
    @Roles(UserRole.COMMUNITY_ADMIN, UserRole.SUPER_ADMIN, UserRole.ADMIN)
    async getCommunityNotices(@CurrentUser() user: JwtPayload) {
        const notices = await this.noticesService.getCommunityNotices(user);
        return { message: 'Notices fetched successfully', data: notices };
    }

    // Get by id
    @Get(':id')
    @HttpCode(HttpStatus.OK)
    async getNotice(@Param('id', ParseIntPipe) id: number) {
        const notice = await this.noticesService.getNoticeById(id);
        return { message: 'Notice fetched successfully', data: notice };
    }

    // update — admin only
    @Patch(':id')
    @HttpCode(HttpStatus.OK)
    @Roles(UserRole.COMMUNITY_ADMIN, UserRole.SUPER_ADMIN)
    async updateNotice(
        @CurrentUser() user: JwtPayload,
        @Param('id', ParseIntPipe) id: number,
        @Body() dto: UpdateNoticeDto,
    ) {
        const notice = await this.noticesService.updateNotice(user, id, dto);
        return { message: 'Notice updated successfully', data: notice };
    }

    // delete — admin only
    @Delete(':id')
    @HttpCode(HttpStatus.OK)
    @Roles(UserRole.COMMUNITY_ADMIN, UserRole.SUPER_ADMIN)
    async deleteNotice(
        @CurrentUser() user: JwtPayload,
        @Param('id', ParseIntPipe) id: number,
    ) {
        return this.noticesService.deleteNotice(user, id);
    }
}