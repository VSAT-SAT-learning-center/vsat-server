import { ResponseHelper } from 'src/common/helpers/response.helper';
import { QuizQuestionDTO } from './dto/quizquestion.dto';
import { QuizQuestionService } from './quizquestion.service';
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
import { SuccessMessages } from 'src/common/constants/success-messages';

@Controller('quizquestion')
export class QuizQuestionController {
    constructor(private readonly quizQuestionService: QuizQuestionService) {}

    @Post()
    async save(@Body() quizQuestionDto: QuizQuestionDTO) {
        try {
            const savedQuizQuestion =
                await this.quizQuestionService.save(quizQuestionDto);
            return ResponseHelper.success(
                HttpStatus.CREATED,
                savedQuizQuestion,
                SuccessMessages.create('Quiz Question'),
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

    @Put(':id')
    async update(
        @Param('id') id: string,
        @Body() quizQuestionDto: QuizQuestionDTO,
    ) {
        try {
            const updatedQuizQuestion = await this.quizQuestionService.update(
                id,
                quizQuestionDto,
            );
            return {
                statusCode: 200,
                message: 'Success',
                data: updatedQuizQuestion,
            };
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
    async find() {
        try {
            const quizQuestions = await this.quizQuestionService.find();
            return ResponseHelper.success(
                HttpStatus.OK,
                quizQuestions,
                SuccessMessages.create('Quiz Question'),
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

    @Get(':id')
    async findById(@Param('id') id: string) {
        try {
            const quizQuestion = await this.quizQuestionService.findById(id);
            return ResponseHelper.success(
                HttpStatus.OK,
                quizQuestion,
                SuccessMessages.create('Quiz Question'),
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
