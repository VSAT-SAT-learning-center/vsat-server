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
import { ExamScoreService } from './exam-score.service';
import { PaginationOptionsDto } from 'src/common/dto/pagination-options.dto.ts';
import { ResponseHelper } from 'src/common/helpers/response.helper';
import { CreateExamScoreDto } from './dto/create-examscore.dto';
import { UpdateExamScoreDto } from './dto/update-examscore.dto';
import { ApiTags } from '@nestjs/swagger';
import { BaseController } from '../base/base.controller';
import { ExamScore } from 'src/database/entities/examscore.entity';
import { SuccessMessages } from 'src/common/constants/success-messages';
import { GetExamScoreDto } from './dto/get-examscore.dto';

@ApiTags('ExamScores')
@Controller('exam-scores')
export class ExamScoreController {
    constructor(private readonly examScoreService: ExamScoreService) {}

    @Post()
    async create(@Body() createExamScoreDto: CreateExamScoreDto) {
        try {
            const savedExamScore =
                await this.examScoreService.create(createExamScoreDto);
            return ResponseHelper.success(
                HttpStatus.OK,
                savedExamScore,
                SuccessMessages.create('ExamScore'),
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
    async getAllExamScoreWithDetails(
        @Query('page') page?: number,
        @Query('pageSize') pageSize?: number,
    ) {
        try {
            const savedExamScore =
                await this.examScoreService.getAllExamScoreWithDetails(
                    page,
                    pageSize,
                );
            return ResponseHelper.success(
                HttpStatus.OK,
                savedExamScore,
                SuccessMessages.get('ExamScore'),
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

    @Post('/exam-structure-type')
    async getExamScoreWithExamStructureType(
        @Body() getExamScoreDto: GetExamScoreDto,
    ) {
        try {
            const savedExamScore =
                await this.examScoreService.getExamScoreWithExamStructureType(
                    getExamScoreDto,
                );
            return ResponseHelper.success(
                HttpStatus.OK,
                savedExamScore,
                SuccessMessages.get('ExamScore'),
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
