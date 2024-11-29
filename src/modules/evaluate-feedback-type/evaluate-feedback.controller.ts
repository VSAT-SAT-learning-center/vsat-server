import {
    ApiTags,
    ApiOperation,
    ApiResponse,
    ApiBody,
    ApiQuery,
    ApiBearerAuth,
} from '@nestjs/swagger';
import { EvaluateFeedbackResponseDto } from './dto/evaluate-feedback-response.dto';
import {
    Body,
    Controller,
    Get,
    Param,
    Post,
    Request,
    UseGuards,
} from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { CreateEvaluateFeedbackDto } from './dto/create-evaluate-feedback.dto';
import { EvaluateFeedbackService } from './evaluate-feedback.service';
import { JwtAuthGuard } from 'src/common/guards/jwt.guard';
import { EvaluateFeedback } from 'src/database/entities/evaluatefeedback.entity';

@ApiTags('EvaluateFeedback') // Tag for Swagger grouping
@Controller('evaluate-feedback')
export class EvaluateFeedbackController {
    constructor(private readonly evaluateFeedbackService: EvaluateFeedbackService) {}

    @Get('teacher-to-student/:teacherId')
    @ApiOperation({ summary: 'Get feedbacks from Teacher to Student' })
    @ApiResponse({ status: 200, description: 'Feedback list retrieved successfully.', type: [EvaluateFeedback] })
    async getFeedbacksForTeacherToStudent(
        @Param('teacherId') teacherId: string,
    ): Promise<EvaluateFeedbackResponseDto[]> {
        return this.evaluateFeedbackService.getFeedbacksForTeacherToStudent(teacherId);
    }

    @Get('teacher-to-staff-about-student/:teacherId')
    @ApiOperation({ summary: 'Get feedbacks from Teacher to Staff about a Student' })
    @ApiResponse({ status: 200, description: 'Feedback list retrieved successfully.', type: [EvaluateFeedback] })
    async getFeedbacksForTeacherToStaffAboutStudent(
        @Param('teacherId') teacherId: string,
    ): Promise<EvaluateFeedbackResponseDto[]> {
        return this.evaluateFeedbackService.getFeedbacksForTeacherToStaffAboutStudent(teacherId);
    }

    @Get('student-to-teacher/:studentId')
    @ApiOperation({ summary: 'Get feedbacks from Student to Teacher' })
    @ApiResponse({ status: 200, description: 'Feedback list retrieved successfully.', type: [EvaluateFeedback] })
    async getFeedbacksForStudentToTeacher(
        @Param('studentId') studentId: string,
    ): Promise<EvaluateFeedbackResponseDto[]> {
        return this.evaluateFeedbackService.getFeedbacksForStudentToTeacher(studentId);
    }

    @Get('student-to-staff-about-teacher/:studentId')
    @ApiOperation({ summary: 'Get feedbacks from Student to Staff about a Teacher' })
    @ApiResponse({ status: 200, description: 'Feedback list retrieved successfully.', type: [EvaluateFeedback] })
    async getFeedbacksForStudentToStaffAboutTeacher(
        @Param('studentId') studentId: string,
    ): Promise<EvaluateFeedbackResponseDto[]> {
        return this.evaluateFeedbackService.getFeedbacksForStudentToStaffAboutTeacher(studentId);
    }

    @Get('staff-to-teacher/:staffId')
    @ApiOperation({ summary: 'Get feedbacks from Staff to Teacher' })
    @ApiResponse({ status: 200, description: 'Feedback list retrieved successfully.', type: [EvaluateFeedback] })
    async getFeedbacksForStaffToTeacher(
        @Param('staffId') staffId: string,
    ): Promise<EvaluateFeedbackResponseDto[]> {
        return this.evaluateFeedbackService.getFeedbacksForStaffToTeacher(staffId);
    }

    @ApiBearerAuth('JWT-auth')
    @UseGuards(JwtAuthGuard)
    @Post('create')
    @ApiOperation({ summary: 'Create new feedback' })
    @ApiResponse({
        status: 201,
        description: 'Feedback created successfully.',
        type: EvaluateFeedback,
    })
    @ApiResponse({ status: 400, description: 'Invalid data or missing fields.' })
    async createFeedback(
        @Body() createFeedbackDto: CreateEvaluateFeedbackDto,
    ): Promise<EvaluateFeedback> {
        return this.evaluateFeedbackService.createFeedback(createFeedbackDto);
    }

    @Get()
    @ApiOperation({ summary: 'Get feedbacks by role and account' })
    @ApiResponse({
        status: 200,
        description: 'List of feedbacks.',
        type: [EvaluateFeedback],
    })
    @ApiResponse({ status: 400, description: 'Invalid role or account ID.' })
    async getFeedbacks(@Request() req): Promise<EvaluateFeedbackResponseDto[]> {
        const userId = req.user?.id;

        return this.evaluateFeedbackService.getEvaluateFeedbacks(userId);
    }
}
