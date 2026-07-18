import { Body, Controller, Get, HttpCode, HttpStatus, Param, ParseIntPipe, Post } from "@nestjs/common";
import { ComplaintsService } from "./complaints.service";
import { CurrentUser } from "src/core/decorators/current-user.decorator";
import { JwtPayload } from "../auth/token.service";
import { CreateComplaintDto } from "./dto/create-complaint.dto";
import { Roles } from "src/core/decorators/roles.decorator";
import { UserRole } from "src/generated/prisma/enums";
import { userInfo } from "os";

@Controller('complaints')
export class ComplaintsController {
    constructor(private readonly complaintsService: ComplaintsService) { }

    //create
    @Post()
    @HttpCode(HttpStatus.CREATED)
    async createComplaint(
        @CurrentUser() user: JwtPayload,
        @Body() dto: CreateComplaintDto,
    ) {
        const complaint = await this.complaintsService.createComplaint(user, dto);
        return { message: 'Complaint submitted successfully', data: complaint };
    }
    //find complaint by complaint id
    @Get(':id')
    @HttpCode(HttpStatus.OK)
    async getComplaint(@Param('id', ParseIntPipe) id: number) {
        const complaint = await this.complaintsService.getComplaintById(id);
        return {message: 'Complaint fetched successfully', data: complaint};
    }
    //get own complaints
    @Get()
    @HttpCode(HttpStatus.OK)
    async getMyComplaints(@CurrentUser() user: JwtPayload) {
        const complaints = await this.complaintsService.getMyComplaints(user);
        return {message: 'Complaints fetched successfully', data: complaints};
    }
    //get complaint by user id
    @Get('user/:userId')
    @HttpCode(HttpStatus.OK)
    async getComplaintsByUserId(@Param('userId', ParseIntPipe) userId: number) {
        const complaints = await this.complaintsService.getComplaintsByUserId(userId);
        return {message: 'Complaints fetched successfully', data: complaints};
    }
    //get complaint by community id
    @Get('community')
    @HttpCode(HttpStatus.OK)
    @Roles(UserRole.COMMUNITY_ADMIN, UserRole.PROPERTY_ADMIN, UserRole.PROPERTY_ADMIN, UserRole.ADMIN)
    async getCommunityComplaints(@CurrentUser() user: JwtPayload) {
        const complaint = await this.complaintsService.getComplaintsByCommunityId(user);
        return {message: 'Complaints fetched successfully', data: complaint};
    }
    //update complaint
    @Post(':id')
    @HttpCode(HttpStatus.OK)
    async updateComplaint(@CurrentUser() user: JwtPayload, @Param('id', ParseIntPipe) id: number, @Body() dto: any) {
        const complaint = await this.complaintsService.updateComplaint(user, id, dto);
        return {message: 'Complaint updated successfully', data: complaint};
    }
    //update status
    @Post(':id/status')
    @HttpCode(HttpStatus.OK)
    async updateStatus(@CurrentUser() user: JwtPayload, @Param('id', ParseIntPipe) id: number, @Body() dto: any) {
        const complaint = await this.complaintsService.updateStatus(user, id, dto);
        return {message: 'Complaint status updated successfully', data: complaint};
    }

}