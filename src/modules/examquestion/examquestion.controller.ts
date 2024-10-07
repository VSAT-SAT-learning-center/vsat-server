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
import { ResponseHelper } from 'src/common/helpers/response.helper';
import { SuccessMessages } from 'src/common/constants/success-messages';
import { ApiTags } from '@nestjs/swagger';
import { BaseController } from '../base/base.controller';
import { ExamQuestion } from 'src/database/entities/examquestion.entity';
import { CreateExamQuestionDTO } from './dto/create-examquestion.dto';

@ApiTags('ExamQuestions')
@Controller('exam-questions')
export class ExamQuestionController {
    constructor(private readonly examQuestionService: ExamQuestionService) {}

    @Post()
    async createExamQuestion(
        @Body() createExamQuestionDto: CreateExamQuestionDTO,
    ) {
        try {
            const examQuestion =
                await this.examQuestionService.createExamQuestion(
                    createExamQuestionDto,
                );
            return ResponseHelper.success(
                HttpStatus.CREATED,
                examQuestion,
                SuccessMessages.create('ExamQuestion'),
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
