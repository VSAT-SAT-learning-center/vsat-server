import {
    Controller,
    Get,
    Param,
    Patch,
    Post,
    Query,
    Req,
    Request,
    UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from 'src/common/guards/jwt.guard';
import { NotificationService } from './notification.service';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { RoleGuard } from 'src/common/guards/role.guard';

@Controller('notifications')
@ApiTags('Notifications')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard)
export class NotificationController {
    constructor(private readonly notificationService: NotificationService) {}

    @Patch(':id/read')
    async markAsRead(
        @Param('id') id: string,
    ): Promise<{ success: boolean; message: string }> {
        await this.notificationService.markAsRead(id);
        return { success: true, message: 'Notification marked as read' };
    }

    @Post('notifications/mark-all-read')
    @ApiOperation({ summary: 'Mark all notifications as read' })
    @ApiResponse({ status: 200, description: 'All notifications marked as read.' })
    @ApiResponse({ status: 404, description: 'No unread notifications found.' })
    async markAllAsRead(@Req() req): Promise<void> {
        const userId = req.user.id;
        await this.notificationService.markAllAsRead(userId);
    }

    @Get()
    async getNotifications(
        @Request() req,
        @Query('isRead') isRead?: boolean,
        // @Query('page') page: number = 1,
        // @Query('limit') limit: number = 10,
    ): Promise<{
        data: any[];
        totalItems: number;
        // totalPages: number;
        // currentPage: number;
    }> {
        const userId = req.user.id; // Retrieve logged-in user's ID
        return this.notificationService.getNotificationsForUser(
            userId,
            isRead,
            // page,
            // limit,
        );
    }
}
