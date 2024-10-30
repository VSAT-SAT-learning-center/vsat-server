import {
    Controller,
    Get,
    Post,
    Body,
    Param,
    HttpStatus,
    BadRequestException,
    Patch,
} from '@nestjs/common';
import { FeedbackService } from './feedback.service';
import { BaseController } from '../base/base.controller';
import { Feedback } from 'src/database/entities/feedback.entity';
import { ApiParam, ApiTags } from '@nestjs/swagger';
import { ResponseHelper } from 'src/common/helpers/response.helper';
import { SuccessMessages } from 'src/common/constants/success-messages';

@ApiTags('Feedbacks')
@Controller('feedbacks')
export class FeedbackController extends BaseController<Feedback> {
    constructor(private readonly feedbackService: FeedbackService) {
        super(feedbackService, 'Feedback');
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
}
