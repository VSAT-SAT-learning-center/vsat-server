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
    HttpException,
    BadRequestException,
} from '@nestjs/common';
import { ExamService } from './exam.service';
import { CreateExamDto } from './dto/create-exam.dto';
import { ResponseHelper } from 'src/common/helpers/response.helper';
import { ApiTags } from '@nestjs/swagger';
import { SuccessMessages } from 'src/common/constants/success-messages';
import { ExamStatus } from 'src/common/enums/exam-status.enum';
import { ExamCensorFeedbackDto } from '../feedback/dto/exam-feedback.dto';

@ApiTags('Exams')
@Controller('exams')
export class ExamController {
    constructor(private readonly examService: ExamService) {}

    @Post()
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

    @Post('/censor/:action')
    async approveOrRejectExam(
        @Param('action') action: 'approve' | 'reject',
        @Body() feedbackDto: ExamCensorFeedbackDto,
    ) {
        if (action !== 'approve' && action !== 'reject') {
            throw new BadRequestException(
                'Invalid action. Use "approve" or "reject".',
            );
        }

        try {
            const feedbacks = this.examService.approveOrRejectExam(
                feedbackDto,
                action,
            );

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
}
