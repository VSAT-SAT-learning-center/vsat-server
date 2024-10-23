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
} from '@nestjs/common';
import { FeedbackService } from './feedback.service';
import { BaseController } from '../base/base.controller';
import { Feedback } from 'src/database/entities/feedback.entity';
import { ApiTags } from '@nestjs/swagger';
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
}
