import { ApiBody, ApiTags } from '@nestjs/swagger';
import { QuestionService } from './question.service';
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
} from '@nestjs/common';
import { CreateQuestionDTO } from './dto/create-question.dto';
import { ResponseHelper } from 'src/common/helpers/response.helper';
import { SuccessMessages } from 'src/common/constants/success-messages';
import { QuestionStatus } from 'src/common/enums/question-status.enum';
import { UpdateQuestionDTO } from './dto/update-question.dto';
import { CreateQuestionFileDto } from './dto/create-question-file.dto';
import { QuestionFeedbackDto } from '../feedback/dto/question-feedback.dto';

@ApiTags('Questions')
@Controller('questions')
export class QuestionController {
    constructor(private readonly questionService: QuestionService) {}

    @Post('import-file')
    @ApiBody({ type: [CreateQuestionFileDto] })
    async save(@Body() createQuestionDto: CreateQuestionFileDto[]) {
        try {
            const saveQuestion =
                await this.questionService.save(createQuestionDto);
            return ResponseHelper.success(
                HttpStatus.CREATED,
                saveQuestion,
                SuccessMessages.create('Question'),
            );
        } catch (error) {
            if (error.code === '23505') {
                throw new HttpException(
                    'Question content already exists',
                    HttpStatus.BAD_REQUEST,
                );
            }
            throw new HttpException(
                {
                    statusCode: error.status || HttpStatus.BAD_REQUEST,
                    message: error.message || 'An error occurred',
                },
                error.status || HttpStatus.BAD_REQUEST,
            );
        }
    }

    @Post()
    async saveManual(@Body() createQuestionDto: CreateQuestionDTO) {
        try {
            const saveQuestion =
                await this.questionService.saveManual(createQuestionDto);
            return ResponseHelper.success(
                HttpStatus.CREATED,
                saveQuestion,
                SuccessMessages.create('Question'),
            );
        } catch (error) {
            if (error.code === '23505') {
                throw new HttpException(
                    'Question content already exists',
                    HttpStatus.BAD_REQUEST,
                );
            }
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
        @Query('status') status?: QuestionStatus,
    ) {
        try {
            const questions = await this.questionService.getAllWithStatus(
                page,
                pageSize,
                status,
            );
            return ResponseHelper.success(
                HttpStatus.OK,
                questions,
                SuccessMessages.get('Question'),
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

    @Put('update-status/:id')
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
    async updateStatus(
        @Param('id') id: string,
        @Body() body: { status: string },
    ) {
        try {
            const { status } = body;
            const checkQuestion = await this.questionService.updateStatus(
                id,
                status as QuestionStatus,
            );

            if (checkQuestion) {
                return ResponseHelper.success(
                    HttpStatus.OK,
                    SuccessMessages.approve(),
                );
            }
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

    @Put('updateQuestion/:id')
    async updateQuestion(
        @Param('id') id: string,
        @Body() updateQuestionDto: UpdateQuestionDTO,
    ) {
        try {
            const question = await this.questionService.updateQuestion(
                id,
                updateQuestionDto,
            );
            return ResponseHelper.success(
                HttpStatus.OK,
                question,
                SuccessMessages.update('Question'),
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

    @Get('get-question-with-answer')
    async getQuestionWithAnswer(
        @Query('page') page?: number,
        @Query('pageSize') pageSize?: number,
    ) {
        try {
            const questions = await this.questionService.getQuestionWithAnswer(
                page,
                pageSize,
            );

            return ResponseHelper.success(
                HttpStatus.OK,
                questions,
                SuccessMessages.get('Question'),
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
                questionIds: { type: 'array', items: { type: 'string' } },
            },
        },
    })
    async publishQuestions(@Body() body: { questionIds: string[] }) {
        try {
            const { questionIds } = body;

            await this.questionService.publish(questionIds);

            return ResponseHelper.success(
                HttpStatus.OK,
                SuccessMessages.update('Questions'),
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
    async approveOrRejectQuestion(
        @Param('action') action: 'approve' | 'reject',
        @Body() feedbackDto: QuestionFeedbackDto,
    ) {
        if (action !== 'approve' && action !== 'reject') {
            throw new BadRequestException(
                'Invalid action. Use "approve" or "reject".',
            );
        }
        
        try {
            const feedbacks = await this.questionService.approveOrRejectQuestion(
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
