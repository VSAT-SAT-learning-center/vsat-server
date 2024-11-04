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
import { CreateExamAttemptDto } from './dto/create-examattempt.dto';
import { UpdateExamAttemptDto } from './dto/update-examattempt.dto';
import { ExamAttemptService } from './exam-attempt.service';
import { PaginationOptionsDto } from 'src/common/dto/pagination-options.dto.ts';
import { ResponseHelper } from 'src/common/helpers/response.helper';
import { BaseController } from '../base/base.controller';
import { ExamAttempt } from 'src/database/entities/examattempt.entity';
import { ApiBody, ApiTags } from '@nestjs/swagger';
import { CreateTargetLearningDto } from '../target-learning/dto/create-targetlearning.dto';
import { SuccessMessages } from 'src/common/constants/success-messages';

@ApiTags('ExamAttempts')
@Controller('exam-attempts')
export class ExamAttemptController {
    constructor(private readonly examAttemptService: ExamAttemptService) {}

    @Post(':id')
    async recommend(
        @Param('id') examAttemptId: string,
        @Body() createTargetLearningDto: CreateTargetLearningDto,
    ) {
        try {
            const recommend = await this.examAttemptService.recommend(
                examAttemptId,
                createTargetLearningDto,
            );
            return ResponseHelper.success(
                HttpStatus.CREATED,
                recommend,
                SuccessMessages.create('Recommend'),
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

    @Get('getExamAtemptDomain/:id')
    async getExamAtemptDomain(@Param('id') id: string, @Query('isCorrect') isCorrect: boolean) {
        try {
            const getExamAtemptDomain = await this.examAttemptService.getExamAtemptDomain(
                id,
                isCorrect,
            );
            return ResponseHelper.success(
                HttpStatus.OK,
                getExamAtemptDomain,
                SuccessMessages.get('ExamAttempt'),
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

    @Get('getExamAtemptSkill/:id')
    async getExamAtemptsSkill(@Param('id') id: string, @Query('isCorrect') isCorrect: boolean) {
        try {
            const getExamAtemptSkill = await this.examAttemptService.getExamAtemptSkil(
                id,
                isCorrect,
            );
            return ResponseHelper.success(
                HttpStatus.OK,
                getExamAtemptSkill,
                SuccessMessages.get('ExamAttempt'),
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
