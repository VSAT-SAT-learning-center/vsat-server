import {
    ApiTags,
    ApiOperation,
    ApiResponse,
    ApiBody,
    ApiQuery,
    ApiBearerAuth,
} from '@nestjs/swagger';
import { EvaluateFeedbackResponseDto } from './dto/evaluate-feedback-response.dto';
import { Body, Controller, Get, Param, Post, Request, UseGuards } from '@nestjs/common';
import { CreateEvaluateFeedbackDto } from './dto/create-evaluate-feedback.dto';
import { EvaluateFeedbackService } from './evaluate-feedback.service';
import { JwtAuthGuard } from 'src/common/guards/jwt.guard';
import { EvaluateFeedback } from 'src/database/entities/evaluatefeedback.entity';
import { create } from 'domain';
import { StudyProfileFeedbackResponseDto } from './dto/studyprofile-feedback.dto';
import { EvaluateFeedbackDetailResponseDto } from './dto/evaluate-feedback-detail-response.dto';
import { CreateFeedbackDto } from './dto/create-feedback.dto';
import { FeedbackResponseDto } from './dto/feedback-response.dto';
import { CreateTeacherFeedbackDto } from './dto/create-teacher-feedback.dto';

@ApiTags('EvaluateFeedback') // Tag for Swagger grouping
@Controller('evaluate-feedback')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard)
export class EvaluateFeedbackController {
    constructor(private readonly evaluateFeedbackService: EvaluateFeedbackService) {}

    @Get('teacher-to-student/:teacherId')
    @ApiOperation({ summary: 'Get feedbacks from Teacher to Student' })
    @ApiResponse({
        status: 200,
        description: 'Feedback list retrieved successfully.',
        type: [EvaluateFeedback],
    })
    async getFeedbacksForTeacherToStudent(
        @Param('teacherId') teacherId: string,
    ): Promise<EvaluateFeedbackResponseDto[]> {
        return this.evaluateFeedbackService.getFeedbacksForTeacherToStudent(teacherId);
    }

    @Get('teacher-to-staff-about-student/:teacherId')
    @ApiOperation({ summary: 'Get feedbacks from Teacher to Staff about a Student' })
    @ApiResponse({
        status: 200,
        description: 'Feedback list retrieved successfully.',
        type: [EvaluateFeedback],
    })
    async getFeedbacksForTeacherToStaffAboutStudent(
        @Param('teacherId') teacherId: string,
    ): Promise<EvaluateFeedbackResponseDto[]> {
        return this.evaluateFeedbackService.getFeedbacksForTeacherToStaffAboutStudent(
            teacherId,
        );
    }

    @Get('student-to-teacher/:studentId')
    @ApiOperation({ summary: 'Get feedbacks from Student to Teacher' })
    @ApiResponse({
        status: 200,
        description: 'Feedback list retrieved successfully.',
        type: [EvaluateFeedback],
    })
    async getFeedbacksForStudentToTeacher(
        @Param('studentId') studentId: string,
    ): Promise<EvaluateFeedbackResponseDto[]> {
        return this.evaluateFeedbackService.getFeedbacksForStudentToTeacher(studentId);
    }

    @Get('student-to-staff-about-teacher/:studentId')
    @ApiOperation({ summary: 'Get feedbacks from Student to Staff about a Teacher' })
    @ApiResponse({
        status: 200,
        description: 'Feedback list retrieved successfully.',
        type: [EvaluateFeedback],
    })
    async getFeedbacksForStudentToStaffAboutTeacher(
        @Param('studentId') studentId: string,
    ): Promise<EvaluateFeedbackResponseDto[]> {
        return this.evaluateFeedbackService.getFeedbacksForStudentToStaffAboutTeacher(
            studentId,
        );
    }

    // @Get('staff-to-teacher/:staffId')
    // @ApiOperation({ summary: 'Get feedbacks from Staff to Teacher' })
    // @ApiResponse({
    //     status: 200,
    //     description: 'Feedback list retrieved successfully.',
    //     type: [EvaluateFeedback],
    // })
    // async getFeedbacksForStaffToTeacher(
    //     @Param('staffId') staffId: string,
    // ): Promise<EvaluateFeedbackResponseDto[]> {
    //     return this.evaluateFeedbackService.getFeedbacksForStaffToTeacher(staffId);
    // }

    @Get('study-profiles')
    @ApiOperation({ summary: 'Get all study profile IDs by accountFrom' })
    @ApiResponse({
        status: 200,
        description: 'List of feedback study profiles for the given accountFrom.',
        type: [StudyProfileFeedbackResponseDto],
    })
    async getStudyProfiles(@Request() req): Promise<{ studyProfileId: string }[]> {
        const accountFromId = req.user?.id;
        return await this.evaluateFeedbackService.getStudyProfileIdsByAccountFrom(
            accountFromId,
        );
    }

    @Post('create')
    @ApiOperation({ summary: 'Create new feedback' })
    @ApiResponse({
        status: 201,
        description: 'Feedback created successfully.',
        type: EvaluateFeedback,
    })
    @ApiResponse({ status: 400, description: 'Invalid data or missing fields.' })
    async createEvaluateFeedback(
        @Body() createFeedbackDto: CreateEvaluateFeedbackDto,
        @Request() req,
    ): Promise<EvaluateFeedback> {
        const accountFromId = req.user?.id;
        createFeedbackDto.accountFromId = accountFromId;

        return this.evaluateFeedbackService.createEvaluateFeedback(createFeedbackDto);
    }

    @Post('createFeedback')
    @ApiOperation({ summary: 'Create new feedback' })
    @ApiResponse({
        status: 201,
        description: 'Feedback created successfully.',
        type: EvaluateFeedback,
    })
    @ApiResponse({ status: 400, description: 'Invalid data or missing fields.' })
    async createFeedback(
        @Body() createFeedbackDto: CreateFeedbackDto,
        @Request() req,
    ): Promise<EvaluateFeedback> {
        const accountFromId = req.user?.id;
        createFeedbackDto.accountFromId = accountFromId;

        return this.evaluateFeedbackService.createFeedback(createFeedbackDto);
    }

    @Post('createFeedbackTeacher')
    @ApiOperation({ summary: 'Create new feedback' })
    @ApiResponse({
        status: 201,
        description: 'Feedback created successfully.',
        type: EvaluateFeedback,
    })
    @ApiResponse({ status: 400, description: 'Invalid data or missing fields.' })
    async createFeedbackTeacher(
        @Body() createFeedbackDto: CreateTeacherFeedbackDto,
        @Request() req,
    ): Promise<EvaluateFeedback> {
        const accountFromId = req.user?.id;
        createFeedbackDto.accountFromId = accountFromId;

        return this.evaluateFeedbackService.createTeacherFeedback(createFeedbackDto);
    }

    @Get('received')
    @ApiOperation({ summary: 'Get feedbacks by role and account' })
    @ApiResponse({
        status: 200,
        description: 'List of feedbacks.',
        type: [EvaluateFeedback],
    })
    @ApiResponse({ status: 400, description: 'Invalid role or account ID.' })
    async getReceivedFeedbacks(@Request() req): Promise<EvaluateFeedbackResponseDto[]> {
        const userId = req.user?.id;

        return this.evaluateFeedbackService.getReceivedEvaluateFeedbacks(userId);
    }

    @Get('sent')
    @ApiOperation({ summary: 'Get feedbacks by role and account' })
    @ApiResponse({
        status: 200,
        description: 'List of feedbacks.',
        type: [EvaluateFeedback],
    })
    @ApiResponse({ status: 400, description: 'Invalid role or account ID.' })
    async getSendedFeedbacks(@Request() req): Promise<EvaluateFeedbackResponseDto[]> {
        const userId = req.user?.id;

        return this.evaluateFeedbackService.getSendedEvaluateFeedbacks(userId);
    }

    @Get('manager')
    @ApiOperation({ summary: 'Get feedbacks by role and account' })
    @ApiResponse({
        status: 200,
        description: 'List of feedbacks.',
        type: [EvaluateFeedback],
    })
    @ApiResponse({ status: 400, description: 'Invalid role or account ID.' })
    async getManagerFeedbacks(): Promise<FeedbackResponseDto[]> {
        return this.evaluateFeedbackService.getManagerReceivedEvaluateFeedbacks();
    }

    @Get('staff')
    @ApiOperation({ summary: 'Get feedbacks by role and account' })
    @ApiResponse({
        status: 200,
        description: 'List of feedbacks.',
        type: [EvaluateFeedback],
    })
    @ApiResponse({ status: 400, description: 'Invalid role or account ID.' })
    async getStaffFeedbacks(): Promise<FeedbackResponseDto[]> {
        return this.evaluateFeedbackService.getStaffReceivedEvaluateFeedbacks();
    }

    @Get('detail/:feedbackId')
    @ApiOperation({ summary: 'Get feedbacks by role and account' })
    @ApiResponse({
        status: 200,
        description: 'List of feedbacks.',
        type: [EvaluateFeedback],
    })
    @ApiResponse({ status: 400, description: 'Invalid role or account ID.' })
    async getFeedbackDetails(
        @Param('feedbackId') feedbackId,
    ): Promise<EvaluateFeedbackDetailResponseDto> {
        return this.evaluateFeedbackService.getFeedbackDetail(feedbackId);
    }
}
