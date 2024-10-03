import { ApiBody, ApiTags } from '@nestjs/swagger';
import { QuestionService } from './question.service';
import {
    Body,
    Controller,
    Get,
    HttpException,
    HttpStatus,
    Param,
    Post,
    Put,
} from '@nestjs/common';
import { CreateQuestionDTO } from './dto/create-question.dto';
import { ResponseHelper } from 'src/common/helpers/response.helper';
import { SuccessMessages } from 'src/common/constants/success-messages';
import { QuestionStatus } from 'src/common/enums/question-status.enum';
import { UpdateQuestionDTO } from './dto/update-question.dto';

@ApiTags('Questions')
@Controller('question')
export class QuestionController {
    constructor(private readonly questionService: QuestionService) {}

    @Post()
    async save(@Body() createQuestionDto: CreateQuestionDTO) {
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
                // PostgreSQL code for unique constraint violation
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
    async getAll() {
        try {
            const questions = await this.questionService.getAll();
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

    @Put('approve-question/:id')
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
    async approve(
        @Param('id') id: string,
        @Body() body: { status: string }, // Nhận toàn bộ body
    ) {
        try {
            const { status } = body;
            const checkQuestion = await this.questionService.approve(
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
}
