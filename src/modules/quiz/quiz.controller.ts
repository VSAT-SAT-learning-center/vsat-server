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
} from '@nestjs/common';
import { QuizService } from './quiz.service';
import { PaginationOptionsDto } from 'src/common/dto/pagination-options.dto.ts';
import { ResponseHelper } from 'src/common/helpers/response.helper';
import { UpdateQuizDto } from './dto/update-quiz.dto';
import { CreateQuizDto } from './dto/create-quiz.dto';
import { BaseController } from '../base/base.controller';
import { Quiz } from 'src/database/entities/quiz.entity';
import { ApiBody, ApiTags } from '@nestjs/swagger';
import { SuccessMessages } from 'src/common/constants/success-messages';

@ApiTags('Quizzes')
@Controller('quizzes')
export class QuizController {
    constructor(private readonly quizService: QuizService) {}

    @Post()
    @ApiBody({ type: CreateQuizDto })
    async save(@Body() createQuizDto: CreateQuizDto) {
        try {
            const saveQuiz = await this.quizService.save(createQuizDto);
            return ResponseHelper.success(
                HttpStatus.CREATED,
                saveQuiz,
                SuccessMessages.create('Quiz'),
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
        @Body() updateQuizDto: UpdateQuizDto,
    ) {
        try {
            const updatedQuiz = await this.quizService.update(
                id,
                updateQuizDto,
            );
            return ResponseHelper.success(
                HttpStatus.OK,
                updatedQuiz,
                SuccessMessages.update('Quiz'),
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
    async getAll(
        @Query('page') page?: number,
        @Query('pageSize') pageSize?: number,
    ) {
        try {
            const quizzes = await this.quizService.getAll(page, pageSize);
            return ResponseHelper.success(
                HttpStatus.OK,
                quizzes,
                SuccessMessages.get('Quiz'),
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
    async getById(@Param('id') id: string) {
        try {
            const quiz = await this.quizService.getById(id);
            return ResponseHelper.success(
                HttpStatus.OK,
                quiz,
                SuccessMessages.get('Quiz'),
            );
        } catch (error) {
            throw new HttpException(
                {
                    statusCode: error.status || HttpStatus.NOT_FOUND,
                    message: error.message || `Quiz with ID ${id} not found`,
                },
                HttpStatus.NOT_FOUND,
            );
        }
    }
}
