import {
    BadRequestException,
    Body,
    Controller,
    Get,
    HttpException,
    HttpStatus,
    Param,
    Patch,
    Post,
    Put,
    Query,
    UseGuards,
} from '@nestjs/common';
import { ApiBody, ApiTags } from '@nestjs/swagger';
import { BaseController } from '../base/base.controller';
import { QuizQuestion } from 'src/database/entities/quizquestion.entity';
import { QuizQuestionService } from './quiz-question.service';
import { CreateQuizQuestionDto } from './dto/create-quizquestion.dto';
import { ResponseHelper } from 'src/common/helpers/response.helper';
import { SuccessMessages } from 'src/common/message/success-messages';
import { QuizQuestionStatus } from 'src/common/enums/quiz-question.status.enum';
import { UpdateQuizQuestionDTO } from './dto/update-quizquestion.dto';
import { CreateQuizQuestionFileDto } from './dto/create-quizquestion-file.dto';
import { QuizQuestionFeedbackDto } from '../feedback/dto/quizquestion-feedback.dto';
import { JwtAuthGuard } from 'src/common/guards/jwt.guard';
import { RoleGuard } from 'src/common/guards/role.guard';

@ApiTags('QuizQuestions')
@Controller('quiz-questions')
export class QuizQuestionController {
    constructor(private readonly quizQuestionService: QuizQuestionService) {}

    @Post()
    @UseGuards(JwtAuthGuard, new RoleGuard(['staff']))
    async saveManual(@Body() createQuizQuestionDto: CreateQuizQuestionDto) {
        try {
            const saveQuestion =
                await this.quizQuestionService.saveQuizQuestion(createQuizQuestionDto);
            return ResponseHelper.success(
                HttpStatus.CREATED,
                saveQuestion,
                SuccessMessages.create('QuizQuestion'),
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
    async getAllWithStatus(
        @Query('page') page?: number,
        @Query('pageSize') pageSize?: number,
        @Query('status') status?: QuizQuestionStatus,
    ) {
        try {
            const questions = await this.quizQuestionService.getAllWithStatus(
                page,
                pageSize,
                status,
            );
            return ResponseHelper.success(
                HttpStatus.OK,
                questions,
                SuccessMessages.get('QuizQuestion'),
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

    @Patch('publish')
    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                quizQuestionIds: { type: 'array', items: { type: 'string' } },
            },
        },
    })
    async publishQuestions(@Body() body: { quizQuestionIds: string[] }) {
        try {
            const { quizQuestionIds } = body;

            await this.quizQuestionService.publish(quizQuestionIds);

            return ResponseHelper.success(
                HttpStatus.OK,
                SuccessMessages.update('QuizQuestions'),
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

    @Put('updateQuizQuestion/:id')
    async updateQuizQuestion(
        @Param('id') id: string,
        @Body() updateQuizQuestionDto: UpdateQuizQuestionDTO,
    ) {
        try {
            const question = await this.quizQuestionService.updateQuizQuestion(
                id,
                updateQuizQuestionDto,
            );
            return ResponseHelper.success(
                HttpStatus.OK,
                question,
                SuccessMessages.update('QuizQuestion'),
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

    @Put('updateStatus/:id')
    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                status: {
                    type: 'string',
                    enum: ['Submit', 'Reject', 'Approved'],
                },
            },
        },
    })
    async updateStatus(@Param('id') id: string, @Body() body: { status: string }) {
        try {
            const { status } = body;
            const question = await this.quizQuestionService.updateStatus(
                id,
                status as QuizQuestionStatus,
            );
            return ResponseHelper.success(
                HttpStatus.OK,
                question,
                SuccessMessages.update('QuizQuestion'),
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

    @Post('import-file')
    @UseGuards(JwtAuthGuard, new RoleGuard(['staff']))
    @ApiBody({ type: [CreateQuizQuestionFileDto] })
    async save(@Body() createQuestionFileDto: CreateQuizQuestionFileDto[]) {
        try {
            const saveQuestion =
                await this.quizQuestionService.save(createQuestionFileDto);
            return ResponseHelper.success(
                HttpStatus.CREATED,
                saveQuestion,
                SuccessMessages.create('QuizQuestion'),
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

    @Post('censor/:action')
    @UseGuards(JwtAuthGuard, new RoleGuard(['manager']))
    async approveOrRejectQuestion(
        @Param('action') action: 'approve' | 'reject',
        @Body() feedbackDto: QuizQuestionFeedbackDto,
    ) {
        if (action !== 'approve' && action !== 'reject') {
            throw new BadRequestException('Invalid action. Use "approve" or "reject".');
        }

        try {
            const feedbacks = await this.quizQuestionService.approveOrRejectQuizQuestion(
                feedbackDto,
                action,
            );

            return ResponseHelper.success(
                HttpStatus.OK,
                feedbacks,
                SuccessMessages.update('Feedback'),
            );
        } catch (error) {
            return ResponseHelper.error(
                error,
                HttpStatus.BAD_REQUEST,
                'Error when updating Feedback',
            );
        }
    }
}
