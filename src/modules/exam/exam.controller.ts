import {
    Controller,
    Get,
    Post,
    Body,
    Param,
    HttpStatus,
    HttpException,
    BadRequestException,
    UseGuards,
    Patch,
    Request,
} from '@nestjs/common';
import { ExamService } from './exam.service';
import { CreateExamDto } from './dto/create-exam.dto';
import { ResponseHelper } from 'src/common/helpers/response.helper';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { SuccessMessages } from 'src/common/message/success-messages';
import { ExamStatus } from 'src/common/enums/exam-status.enum';
import { ExamCensorFeedbackDto } from '../feedback/dto/exam-feedback.dto';
import { JwtAuthGuard } from 'src/common/guards/jwt.guard';
import { RoleGuard } from 'src/common/guards/role.guard';

@ApiTags('Exams')
@Controller('exams')
@ApiBearerAuth('JWT-auth')
export class ExamController {
    constructor(private readonly examService: ExamService) {}

    @Post()
    @UseGuards(JwtAuthGuard, new RoleGuard(['staff']))
    async create(@Body() createExamDto: CreateExamDto) {
        try {
            const exam = await this.examService.createExam(createExamDto);

            return ResponseHelper.success(
                HttpStatus.CREATED,
                exam,
                SuccessMessages.create('Exam'),
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

    @Get()
    async GetExamWithExamQuestion() {
        try {
            const exam = await this.examService.GetExamWithExamQuestion();

            return ResponseHelper.success(
                HttpStatus.CREATED,
                exam,
                SuccessMessages.get('Exam'),
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

    @Get('/getExamByCreateBy')
    @UseGuards(JwtAuthGuard, new RoleGuard(['staff']))
    async GetExamWithExamQuestionByCreateBy(@Request() req) {
        try {
            const exam = await this.examService.GetExamWithExamQuestionByCreateBy(
                req.user.id,
            );

            return ResponseHelper.success(
                HttpStatus.CREATED,
                exam,
                SuccessMessages.get('Exam'),
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

    @Get(':status')
    async GetExamWithExamQuestionByStatus(@Param('status') status: ExamStatus) {
        try {
            const exam = await this.examService.GetExamWithExamQuestionByStatus(status);

            return ResponseHelper.success(
                HttpStatus.CREATED,
                exam,
                SuccessMessages.get('Exam'),
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

    @Get('getExamWithExamQuestionByStatusByCreateBy/:status')
    @UseGuards(JwtAuthGuard)
    async GetExamWithExamQuestionByStatusByCreateBy(
        @Request() req,
        @Param('status') status: ExamStatus,
    ) {
        try {
            const exam = await this.examService.GetExamWithExamQuestionByStatusByCreateBy(
                status,
                req.user.id,
            );

            return ResponseHelper.success(
                HttpStatus.CREATED,
                exam,
                SuccessMessages.get('Exam'),
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

    @Post('/censor/:action')
    async approveOrRejectExam(
        @Param('action') action: 'approve' | 'reject',
        @Body() feedbackDto: ExamCensorFeedbackDto,
    ) {
        if (action !== 'approve' && action !== 'reject') {
            throw new BadRequestException('Invalid action. Use "approve" or "reject".');
        }

        try {
            const feedbacks = this.examService.approveOrRejectExam(feedbackDto, action);

            return ResponseHelper.success(
                HttpStatus.OK,
                feedbacks,
                SuccessMessages.update('Feedback'),
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

    @Patch('/updateStatus/:id/:status')
    async updateStatus(@Param('id') id: string, @Param('status') status: ExamStatus) {
        try {
            const exam = this.examService.updateStatus(id, status);

            return ResponseHelper.success(
                HttpStatus.OK,
                exam,
                SuccessMessages.update('Exam'),
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

    @Get('getExamById/:id')
    async getExamDetails(@Param('id') examId: string) {
        try {
            const exam = await this.examService.getExamDetails(examId);

            return ResponseHelper.success(
                HttpStatus.OK,
                exam,
                SuccessMessages.get('Exam'),
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

    @Get('getExamByExamType/:name')
    async GetExamWithExamQuestionByExamType(@Param('name') examTypeName: string) {
        try {
            const exam =
                await this.examService.GetExamWithExamQuestionByExamType(examTypeName);

            return ResponseHelper.success(
                HttpStatus.OK,
                exam,
                SuccessMessages.get('Exam'),
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
}
