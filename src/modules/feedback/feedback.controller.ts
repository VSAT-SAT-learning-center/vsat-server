import {
    Controller,
    Get,
    Post,
    Body,
    Param,
    Delete,
    Query,
    Put,
    HttpStatus,
    BadRequestException,
    Patch,
} from '@nestjs/common';
import { FeedbackService } from './feedback.service';
import { BaseController } from '../base/base.controller';
import { Feedback } from 'src/database/entities/feedback.entity';
import { ApiParam, ApiTags } from '@nestjs/swagger';
import { FeedbackDto } from './dto/get-feedback.dto';
import { ResponseHelper } from 'src/common/helpers/response.helper';
import { SuccessMessages } from 'src/common/constants/success-messages';

@ApiTags('Feedbacks')
@Controller('feedbacks')
export class FeedbackController extends BaseController<Feedback> {
    constructor(private readonly feedbackService: FeedbackService) {
        super(feedbackService, 'Feedback');
    }

    @Post('/censor/:action')
    async approveOrRejectLearningMaterial(
        @Param('action') action: 'approve' | 'reject', // Accept 'approve' or 'reject' action
        @Body() feedbackDto: FeedbackDto, // The DTO that includes feedback
    ) {
        if (action !== 'approve' && action !== 'reject') {
            throw new BadRequestException(
                'Invalid action. Use "approve" or "reject".',
            );
        }
        const feedbacks = this.feedbackService.approveOrRejectLearningMaterial(
            feedbackDto,
            action,
        );

        return ResponseHelper.success(
            HttpStatus.OK,
            feedbacks,
            SuccessMessages.update('Feedback'),
        );
    }

    @Get('user/:userId')
    async getFeedbackByUserId(@Param('userId') userId: string) {
        const feedback = await this.feedbackService.getFeedbackByUserId(userId);
        return ResponseHelper.success(
            HttpStatus.OK,
            feedback,
            SuccessMessages.gets('Feedback'),
        );
    }

    @Patch(':id/mark-as-read')
    @ApiParam({ name: 'id', required: true, description: 'ID of the feedback' }) // Swagger parameter
    async markFeedbackAsRead(@Param('id') feedbackId: string) {
        const updatedFeedback =
            await this.feedbackService.markAsRead(feedbackId);
        return ResponseHelper.success(
            HttpStatus.OK,
            updatedFeedback,
            'Feedback marked as read successfully',
        );
    }
}
