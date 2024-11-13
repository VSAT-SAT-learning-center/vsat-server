import {
    Controller,
    Get,
    Post,
    Body,
    Param,
    HttpStatus,
    BadRequestException,
    Patch,
    HttpException,
    Request,
    Query,
    NotFoundException,
} from '@nestjs/common';
import { FeedbackService } from './feedback.service';
import { BaseController } from '../base/base.controller';
import { Feedback } from 'src/database/entities/feedback.entity';
import { ApiParam, ApiQuery, ApiTags } from '@nestjs/swagger';
import { ResponseHelper } from 'src/common/helpers/response.helper';
import { SuccessMessages } from 'src/common/constants/success-messages';
import { UnitFeedbackResponseDto } from './dto/get-unit-feedback.dto';
import { ExamFeedbackResponseDto } from './dto/get-exam-feedback.dto';
import { QuestionFeedbackResponseDto } from './dto/get-question-feedback.dto';
import { UnitFeedbackWithLessonResponseDto } from './dto/get-unit-feedback-with-lesson.dto';
import { FeedbackStatus } from 'src/common/enums/feedback-status.enum';
import { QuestionFeedbackDto } from './dto/question-feedback.dto';
import { FeedbackDetailResponseDto } from './dto/get-feedback-details.dto';

@ApiTags('Feedbacks')
@Controller('feedbacks')
export class FeedbackController extends BaseController<Feedback> {
    constructor(private readonly feedbackService: FeedbackService) {
        super(feedbackService, 'Feedback');
    }

    //get feedback by feedback id
    @Get(':feedbackId')
    async getFeedbackDetails(@Param('feedbackId') feedbackId: string): Promise<FeedbackDetailResponseDto> {
        try {
            const feedbackDetails = await this.feedbackService.getFeedbackDetails(feedbackId);
            return feedbackDetails;
        } catch (error) {
            if (error instanceof NotFoundException) {
                throw new NotFoundException('Feedback not found');
            }
            throw error;
        }
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

    @Get('question/:questionId')
    async getQuestionFeedbackByUserId(
        @Request() req,
        @Param('questionId') questionId: string,
    ) {
        try {
            const userId = req.user['id'];
            const feedback = await this.feedbackService.getQuestionFeedbackUserId(
                userId,
                questionId,
            );
            return ResponseHelper.success(
                HttpStatus.OK,
                feedback,
                SuccessMessages.gets('Feedback'),
            );
        } catch (error) {
            throw new HttpException(
                {
                    statusCode: error.status || HttpStatus.BAD_REQUEST,
                    message: error.message || 'An error occurred',
                },
                error.status || HttpStatus.BAD_REQUEST,
            );
        }
    }

    @Get('question/:userId')
    @ApiParam({ name: 'userId', description: 'ID of the user' })
    @ApiQuery({ name: 'questionId', required: false })
    async getQuestionFeedback(
        @Param('userId') userId: string,
        @Query('questionId') questionId?: string,
    ): Promise<QuestionFeedbackResponseDto[]> {
        if (questionId) {
            return await this.feedbackService.getQuestionFeedbackUserId(
                userId,
                questionId,
            );
        }
        return await this.feedbackService.getAllQuestionFeedbackUserId(userId);
    }

    @Get('exam/:userId')
    @ApiParam({ name: 'userId', description: 'ID of the user' })
    @ApiQuery({ name: 'examId', required: false })
    async getExamFeedback(
        @Param('userId') userId: string,
        @Query('examId') examId?: string,
    ): Promise<ExamFeedbackResponseDto[]> {
        if (examId) {
            return await this.feedbackService.getExamFeedbackByUserId(userId, examId);
        }
        return await this.feedbackService.getAllExamFeedbackByUserId(userId);
    }

    @Get('unit/:userId')
    @ApiParam({ name: 'userId', description: 'ID of the user' })
    @ApiQuery({ name: 'unitId', required: false })
    async getUnitFeedback(
        @Param('userId') userId: string,
        @Query('unitId') unitId?: string,
    ): Promise<UnitFeedbackResponseDto[]> {
        if (unitId) {
            return await this.feedbackService.getUnitFeedbackByUserId(userId, unitId);
        }
        throw new NotFoundException('Unit ID is required for specific unit feedback');
    }

    @Get('unit/:userId/with-lessons')
    @ApiParam({ name: 'userId', description: 'ID of the user' })
    @ApiQuery({ name: 'unitId', required: true })
    async getUnitFeedbackWithLesson(
        @Param('userId') userId: string,
        @Query('unitId') unitId: string,
    ): Promise<UnitFeedbackWithLessonResponseDto[]> {
        return await this.feedbackService.getUnitFeedbackWithLesson(userId, unitId);
    }

    @Get('lesson/:userId')
    @ApiParam({ name: 'userId', description: 'ID of the user' })
    @ApiQuery({ name: 'lessonId', required: true })
    async getLessonFeedback(
        @Param('userId') userId: string,
        @Query('lessonId') lessonId: string,
    ): Promise<QuestionFeedbackResponseDto[]> {
        return await this.feedbackService.getLessonFeedbackUserId(userId, lessonId);
    }

    @Get('exam')
    async getExamFeedbackByStatus(
        @Query('status') status: FeedbackStatus,
    ): Promise<ExamFeedbackResponseDto[]> {
        if (!status) {
            throw new BadRequestException('Status is required');
        }
        return this.feedbackService.getExamFeedbackByStatus(status);
    }

    @Get('unit')
    async getUnitFeedbackByStatus(
        @Query('status') status: FeedbackStatus,
    ): Promise<UnitFeedbackResponseDto[]> {
        if (!status) {
            throw new BadRequestException('Status is required');
        }
        return this.feedbackService.getUnitFeedbackByStatus(status);
    }

    @Get('question')
    async getQuestionFeedbackByStatus(
        @Query('status') status: FeedbackStatus,
    ): Promise<QuestionFeedbackResponseDto[]> {
        if (!status) {
            throw new BadRequestException('Status is required');
        }
        return this.feedbackService.getQuestionFeedbackByStatus(status);
    }
}
