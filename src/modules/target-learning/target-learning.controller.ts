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
import { CreateTargetLearningDto } from './dto/create-targetlearning.dto';
import { UpdateTargetLearningDto } from './dto/update-targetlearning.dto';
import { TargetLearningService } from './target-learning.service';
import { PaginationOptionsDto } from 'src/common/dto/pagination-options.dto.ts';
import { ResponseHelper } from 'src/common/helpers/response.helper';
import { BaseController } from '../base/base.controller';
import { TargetLearning } from 'src/database/entities/targetlearning.entity';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { SuccessMessages } from 'src/common/constants/success-messages';

@ApiTags('TargetLearnings')
@Controller('target-learnings')
@ApiBearerAuth('JWT-auth')
export class TargetLearningController {
    constructor(private readonly targetLearningService: TargetLearningService) {}

    @Get('getStatisticByTargetLearning')
    async getWithExamAttempt(@Query('targetLearningId') targetLearningId: string) {
        try {
            const targetLearning =
                await this.targetLearningService.getWithExamAttempt(targetLearningId);
            return ResponseHelper.success(
                HttpStatus.OK,
                targetLearning,
                SuccessMessages.get('TargetLearning'),
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

    @Get('getTargetLearningByStudyProfile')
    async getTargetLearningByStudyProfile(
        @Query('studyProfileId') studyProfileId: string,
    ) {
        try {
            const targetLearning =
                await this.targetLearningService.getTargetLearningByStudyProfile(
                    studyProfileId,
                );
            return ResponseHelper.success(
                HttpStatus.OK,
                targetLearning,
                SuccessMessages.get('TargetLearning'),
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
