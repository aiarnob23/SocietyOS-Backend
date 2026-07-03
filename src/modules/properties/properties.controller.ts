import {
    Body, Controller, Delete, Get,
    HttpCode, HttpStatus, Param,
    ParseIntPipe, Patch, Post,
} from '@nestjs/common';
import { PropertiesService } from './properties.service';
import { CreatePropertyDto } from './dto/create-property.dto';
import { UpdatePropertyDto } from './dto/update-property.dto';
import { AssignAdminDto } from './dto/assign-admin.dto';
import { CreateFlatDto } from './dto/create-flat.dto';
import { CurrentUser } from 'src/core/decorators/current-user.decorator';
import { Roles } from 'src/core/decorators/roles.decorator';
import { JwtPayload } from '../auth/token.service';
import { UserRole } from 'src/generated/prisma/client';

@Controller('properties')
export class PropertiesController {
    constructor(private readonly propertiesService: PropertiesService) {}

    // ── Property ─────────────────────────────────────────

    @Post()
    @HttpCode(HttpStatus.CREATED)
    @Roles(UserRole.COMMUNITY_ADMIN)
    async createProperty(
        @CurrentUser() user: JwtPayload,
        @Body() dto: CreatePropertyDto,
    ) {
        const property = await this.propertiesService.createProperty(user, dto);
        return { message: 'Property created successfully', data: property };
    }

    @Get()
    @HttpCode(HttpStatus.OK)
    @Roles(UserRole.COMMUNITY_ADMIN, UserRole.SUPER_ADMIN)
    async getProperties(@CurrentUser() user: JwtPayload) {
        const properties = await this.propertiesService.getPropertiesByCommunity(user);
        return { message: 'Properties fetched successfully', data: properties };
    }

    @Get(':id')
    @HttpCode(HttpStatus.OK)
    async getProperty(@Param('id', ParseIntPipe) id: number) {
        const property = await this.propertiesService.getPropertyById(id);
        return { message: 'Property fetched successfully', data: property };
    }

    @Patch(':id')
    @HttpCode(HttpStatus.OK)
    @Roles(UserRole.COMMUNITY_ADMIN, UserRole.PROPERTY_ADMIN, UserRole.SUPER_ADMIN)
    async updateProperty(
        @CurrentUser() user: JwtPayload,
        @Param('id', ParseIntPipe) id: number,
        @Body() dto: UpdatePropertyDto,
    ) {
        const property = await this.propertiesService.updateProperty(user, id, dto);
        return { message: 'Property updated successfully', data: property };
    }

    @Post(':id/admin')
    @HttpCode(HttpStatus.OK)
    @Roles(UserRole.COMMUNITY_ADMIN)
    async assignAdmin(
        @CurrentUser() user: JwtPayload,
        @Param('id', ParseIntPipe) id: number,
        @Body() dto: AssignAdminDto,
    ) {
        const property = await this.propertiesService.assignPropertyAdmin(user, id, dto);
        return { message: 'Property admin assigned successfully', data: property };
    }

    @Delete(':id')
    @HttpCode(HttpStatus.OK)
    @Roles(UserRole.COMMUNITY_ADMIN, UserRole.SUPER_ADMIN)
    async deleteProperty(
        @CurrentUser() user: JwtPayload,
        @Param('id', ParseIntPipe) id: number,
    ) {
        return this.propertiesService.deleteProperty(user, id);
    }

    // ── Flat ─────────────────────────────────────────────

    @Post(':id/flats')
    @HttpCode(HttpStatus.CREATED)
    @Roles(UserRole.COMMUNITY_ADMIN, UserRole.PROPERTY_ADMIN)
    async createFlat(
        @CurrentUser() user: JwtPayload,
        @Param('id', ParseIntPipe) propertyId: number,
        @Body() dto: CreateFlatDto,
    ) {
        const flat = await this.propertiesService.createFlat(user, propertyId, dto);
        return { message: 'Flat created successfully', data: flat };
    }

    @Get(':id/flats')
    @HttpCode(HttpStatus.OK)
    async getFlats(@Param('id', ParseIntPipe) propertyId: number) {
        const flats = await this.propertiesService.getFlatsByProperty(propertyId);
        return { message: 'Flats fetched successfully', data: flats };
    }

    @Post('flats/:flatId/owner')
    @HttpCode(HttpStatus.OK)
    @Roles(UserRole.COMMUNITY_ADMIN, UserRole.PROPERTY_ADMIN)
    async assignFlatOwner(
        @CurrentUser() user: JwtPayload,
        @Param('flatId', ParseIntPipe) flatId: number,
        @Body() dto: AssignAdminDto,
    ) {
        const flat = await this.propertiesService.assignFlatOwner(user, flatId, dto);
        return { message: 'Flat owner assigned successfully', data: flat };
    }

    @Delete('flats/:flatId')
    @HttpCode(HttpStatus.OK)
    @Roles(UserRole.COMMUNITY_ADMIN, UserRole.PROPERTY_ADMIN, UserRole.SUPER_ADMIN)
    async deleteFlat(
        @CurrentUser() user: JwtPayload,
        @Param('flatId', ParseIntPipe) flatId: number,
    ) {
        return this.propertiesService.deleteFlat(user, flatId);
    }
}