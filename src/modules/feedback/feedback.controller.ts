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

    // Route cho feedback chung theo status
    @Get('question')
    async getQuestionFeedbackByStatus(
        @Query('status') status: FeedbackStatus,
    ): Promise<QuestionFeedbackResponseDto[]> {
        if (!status) {
            throw new BadRequestException('Status is required');
        }
        return this.feedbackService.getQuestionFeedbackByStatus(status);
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

    // GET /feedbacks/exam?examId=123
    @Get('exam')
    @ApiQuery({ name: 'examId', required: false })
    async getExamFeedback(
        @Request() req: any,
        @Query('examId') examId?: string,
    ): Promise<ExamFeedbackResponseDto[]> {
        const userId = req.user?.id; // Lấy userId từ request
        if (!userId) {
            throw new NotFoundException('User ID not found in request');
        }

        if (examId) {
            return await this.feedbackService.getExamFeedbackByUserId(userId, examId);
        }
        return await this.feedbackService.getAllExamFeedbackByUserId(userId);
    }

    // GET /feedbacks/unit?unitId=123
    @Get('unit')
    @ApiQuery({ name: 'unitId', required: false })
    async getUnitFeedback(
        @Request() req: any,
        @Query('unitId') unitId?: string,
    ): Promise<UnitFeedbackResponseDto[]> {
        const userId = req.user?.id; // Lấy userId từ request
        if (!userId) {
            throw new NotFoundException('User ID not found in request');
        }

        if (unitId) {
            return await this.feedbackService.getUnitFeedbackByUserId(userId, unitId);
        }
        throw new NotFoundException('Unit ID is required for specific unit feedback');
    }

    // GET /feedbacks/unit/with-lessons?unitId=123
    @Get('unit/with-lessons')
    @ApiQuery({ name: 'unitId', required: true })
    async getUnitFeedbackWithLesson(
        @Request() req: any,
        @Query('unitId') unitId: string,
    ): Promise<UnitFeedbackWithLessonResponseDto[]> {
        const userId = req.user?.id; // Lấy userId từ request
        if (!userId) {
            throw new NotFoundException('User ID not found in request');
        }

        return await this.feedbackService.getUnitFeedbackWithLesson(userId, unitId);
    }

    // GET /feedbacks/lesson?lessonId=123
    @Get('lesson')
    @ApiQuery({ name: 'lessonId', required: true })
    async getLessonFeedback(
        @Request() req: any,
        @Query('lessonId') lessonId: string,
    ): Promise<QuestionFeedbackResponseDto[]> {
        const userId = req.user?.id; // Lấy userId từ request
        if (!userId) {
            throw new NotFoundException('User ID not found in request');
        }

        return await this.feedbackService.getLessonFeedbackUserId(userId, lessonId);
    }

    // GET /feedbacks/:feedbackId
    @Get(':feedbackId')
    async getFeedbackDetails(
        @Param('feedbackId') feedbackId: string,
    ): Promise<FeedbackDetailResponseDto> {
        try {
            return await this.feedbackService.getFeedbackDetails(feedbackId);
        } catch (error) {
            if (error instanceof NotFoundException) {
                throw new NotFoundException('Feedback not found');
            }
            throw error;
        }
    }

    // GET /feedbacks/user
    @Get('user')
    async getFeedbackByUserId(@Request() req: any) {
        const userId = req.user?.id; // Lấy userId từ request
        if (!userId) {
            throw new NotFoundException('User ID not found in request');
        }

        const feedback = await this.feedbackService.getFeedbackByUserId(userId);
        return feedback;
    }
}
