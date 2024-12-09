import {
    Controller,
    Get,
    Param,
    Request,
    Query,
    NotFoundException,
    UseGuards,
} from '@nestjs/common';
import { FeedbackService } from './feedback.service';
import { BaseController } from '../base/base.controller';
import { Feedback } from 'src/database/entities/feedback.entity';
import {
    ApiBearerAuth,
    ApiOperation,
    ApiTags,
} from '@nestjs/swagger';
import { FeedbackStatus } from 'src/common/enums/feedback-status.enum';
import { FeedbackDetailResponseDto } from './dto/get-feedback-details.dto';
import { JwtAuthGuard } from 'src/common/guards/jwt.guard';
import { RoleGuard } from 'src/common/guards/role.guard';
import { LessonFeedbackResponseDto } from './dto/get-lesson-feedback.dto';
import { ModuleTypeFeedbackResponseDto } from './dto/get-moduletype-feedback.dto';

@ApiTags('Feedbacks')
@Controller('feedbacks')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard, new RoleGuard(['staff', 'manager']))
export class FeedbackController extends BaseController<Feedback> {
    constructor(private readonly feedbackService: FeedbackService) {
        super(feedbackService, 'Feedback');
    }

    @ApiOperation({ summary: 'Search learning material feedback by status' })
    @Get('learning-material')
    async searchFeedbackByStatus(
        @Query('status') status: FeedbackStatus,
        @Request() req,
        @Query('search') search?: string,
        @Query('domain') domain?: string,
        @Query('section') section?: string,
        @Query('level') level?: string,
        @Query('page') page: number = 1,
        @Query('limit') limit: number = 10,
    ): Promise<{
        data: any[];
        totalItems: number;
        totalPages: number;
        currentPage: number;
    }> {
        const userId = req.user.id;
        return this.feedbackService.searchLearningMaterialFeedbackByStatus(
            status,
            userId,
            search,
            domain,
            section,
            level,
            page,
            limit,
        );
    }

    @ApiOperation({ summary: 'Search exam feedback by status' })
    @Get('exam')
    async searchExamFeedbackByStatus(
        @Query('status') status: FeedbackStatus,
        @Request() req,
        @Query('search') search?: string,
        @Query('examType') examType?: string,
        @Query('examStructure') examStructure?: string,
        @Query('page') page: number = 1,
        @Query('limit') limit: number = 10,
    ): Promise<{
        data: any[];
        totalItems: number;
        totalPages: number;
        currentPage: number;
    }> {
        const userId = req.user.id;
        return this.feedbackService.searchExamFeedbackByStatus(
            status,
            userId,
            search,
            examType,
            examStructure,
            page,
            limit,
        );
    }

    @ApiOperation({ summary: 'Search question feedback by status' })
    @Get('question')
    async searchQuestionFeedbackByStatus(
        @Query('status') status: FeedbackStatus,
        @Request() req,
        @Query('search') search?: string,
        @Query('level') level?: string,
        @Query('skill') skill?: string,
        @Query('section') section?: string,
        @Query('page') page: number = 1,
        @Query('limit') limit: number = 10,
    ): Promise<{
        data: any[];
        totalItems: number;
        totalPages: number;
        currentPage: number;
    }> {
        const userId = req.user.id;
        return this.feedbackService.searchQuestionFeedbackByStatus(
            status,
            userId,
            search,
            level,
            skill,
            section,
            page,
            limit,
        );
    }

    @ApiOperation({ summary: 'Search quiz question feedback by status' })
    @Get('quizquestion')
    async searchQuizQuestionFeedbackByStatus(
        @Query('status') status: FeedbackStatus,
        @Request() req,
        @Query('search') search?: string,
        @Query('level') level?: string,
        @Query('skill') skill?: string,
        @Query('section') section?: string,
        @Query('page') page: number = 1,
        @Query('limit') limit: number = 10,
    ): Promise<{
        data: any[];
        totalItems: number;
        totalPages: number;
        currentPage: number;
    }> {
        const userId = req.user.id;
        return this.feedbackService.searchQuizQuestionFeedbackByStatus(
            status,
            userId,
            search,
            level,
            skill,
            section,
            page,
            limit,
        );
    }

    @ApiOperation({ summary: 'Get feedback details by question id' })
    @Get('question/reason/:questionId')
    async getRejectFeedbackByQuestionId(
        @Param('questionId') questionId: string,
    ): Promise<{
        data: any[];
        totalItems: number;
    }> {
        return this.feedbackService.getRejectFeedbackByQuestionId(questionId);
    }

    @ApiOperation({ summary: 'Get feedback details by question id' })
    @Get('quizQuestion/reason/:quizQuestionId')
    async getRejectFeedbackByQuestionQuizId(
        @Param('quizQuestionId') quizQuestionId: string,
    ): Promise<{
        data: any[];
        totalItems: number;
    }> {
        return this.feedbackService.getRejectFeedbackByQuestionQuizId(quizQuestionId);
    }

    @ApiOperation({ summary: 'Search exam feedback by status' })
    @Get('exam/reason/:examId')
    async getRejectFeedbackByExamId(@Param('examId') examId: string): Promise<{
        data: any[];
        totalItems: number;
    }> {
        return this.feedbackService.getRejectFeedbackByExamId(examId);
    }

    @Get('lesson/reason/:lessonId')
    async getLessonFeedback(
        @Param('lessonId') lessonId: string,
    ): Promise<LessonFeedbackResponseDto[]> {
        if (!lessonId) {
            throw new Error('Lesson ID is required');
        }

        return this.feedbackService.getLessonFeedback(lessonId);
    }


    @Get('moduletype/reason/:moduleTypeId')
    async getModuleTypeFeedback(
        @Param('moduleTypeId') moduleTypeId: string,
    ): Promise<ModuleTypeFeedbackResponseDto[]> {
        if (!moduleTypeId) {
            throw new Error('moduleTypeId ID is required');
        }

        return this.feedbackService.getModuleTypeFeedback(moduleTypeId);
    }

    @ApiOperation({ summary: 'Get user feedback' })
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

    @ApiOperation({ summary: 'Get feedback details' })
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

    
}
