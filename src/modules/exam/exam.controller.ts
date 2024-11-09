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
import { ExamService } from './exam.service';
import { CreateExamDto } from './dto/create-exam.dto';
import { UpdateExamDto } from './dto/update-exam.dto';
import { PaginationOptionsDto } from 'src/common/dto/pagination-options.dto.ts';
import { ResponseHelper } from 'src/common/helpers/response.helper';
import { Exam } from 'src/database/entities/exam.entity';
import { BaseController } from '../base/base.controller';
import { ApiTags } from '@nestjs/swagger';
import { SuccessMessages } from 'src/common/constants/success-messages';

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
}
