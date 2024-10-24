import {
    Body,
    Controller,
    Get,
    HttpException,
    HttpStatus,
    Param,
    Post,
    Put,
    Query,
} from '@nestjs/common';
import { ApiBody, ApiTags } from '@nestjs/swagger';
import { SuccessMessages } from 'src/common/constants/success-messages';
import { QuestionStatus } from 'src/common/enums/question-status.enum';
import { ResponseHelper } from 'src/common/helpers/response.helper';
import { CreateQuestionDTO } from './dto/create-question.dto';
import { UpdateQuestionDTO } from './dto/update-question.dto';
import { QuestionService } from './question.service';

@ApiTags('Questions')
@Controller('questions')
export class QuestionController {
    constructor(private readonly questionService: QuestionService) {}

    @Post()
    @ApiBody({ type: [CreateQuestionDTO] })
    async save(@Body() createQuestionDto: CreateQuestionDTO[]) {
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

    @Get()
    async getAll(
        @Query('page') page?: number,
        @Query('pageSize') pageSize?: number,
    ) {
        try {
            const questions = await this.questionService.getAll(page, pageSize);
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

    @Put('updateNotApprove/:id')
    async updateNotApproved(
        @Param('id') id: string,
        @Body() updateQuestionDto: UpdateQuestionDTO,
    ) {
        try {
            const question =
                await this.questionService.updateQuestionNotApproved(
                    id,
                    updateQuestionDto,
                );
            return ResponseHelper.success(
                HttpStatus.OK,
                question,
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
}
