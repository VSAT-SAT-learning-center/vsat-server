import {
    Body,
    Controller,
    Get,
    HttpException,
    HttpStatus,
    Param,
    Post,
    Put,
    Req,
} from '@nestjs/common';
import { ExamQuestionService } from './examquestion.service';
import { ExamQuestionDTO } from './dto/examquestion.dto';
import { ResponseHelper } from 'src/common/helpers/response.helper';
import { SuccessMessages } from 'src/common/constants/success-messages';

@Controller('examquestion')
export class ExamQuestionController {
    constructor(private readonly examQuestionService: ExamQuestionService) {}

    @Get()
    async find() {
        try {
            const quizQuestion = await this.examQuestionService.find();
            return ResponseHelper.success(
                HttpStatus.OK,
                quizQuestion,
                SuccessMessages.create('QuizQuestion'),
            );
        } catch (error) {
            throw new HttpException(
                {
                    statusCode: error.status || HttpStatus,
                    message: error.message || 'An error occurred',
                },
                error.status || HttpStatus.BAD_REQUEST,
            );
        }
    }

    @Get(':id')
    async findById(@Param('id') id: string) {
        try {
            const quizQuestion = await this.examQuestionService.findById(id);
            return ResponseHelper.success(
                HttpStatus.OK,
                quizQuestion,
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

    @Post()
    async save(@Body() examQuestionDto: ExamQuestionDTO, @Req() req) {
        try {
            const userId = req.user.id;
            const saveExamQuestion = await this.examQuestionService.save(
                examQuestionDto,
                userId,
            );
            return ResponseHelper.success(
                HttpStatus.CREATED,
                saveExamQuestion,
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

    @Put(':id')
    async update(
        @Param('id') id: string,
        @Body() examQuestionDto: ExamQuestionDTO,
        @Req() req,
    ) {
        try {
            const userId = req.user.id;
            const updateExamQuestion = await this.examQuestionService.update(
                id,
                examQuestionDto,
                userId,
            );
            return ResponseHelper.success(
                HttpStatus.OK,
                updateExamQuestion,
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
}
