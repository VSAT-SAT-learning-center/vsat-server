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
import { CreateExamAttemptDetailDto } from './dto/create-examattemptdetail.dto';
import { UpdateExamAttemptDetailDto } from './dto/update-examattemptdetail.dto';
import { ExamAttemptDetailService } from './exam-attempt-detail.service';
import { PaginationOptionsDto } from 'src/common/dto/pagination-options.dto.ts';
import { ResponseHelper } from 'src/common/helpers/response.helper';
import { BaseController } from '../base/base.controller';
import { ExamAttemptDetail } from 'src/database/entities/examattemptdetail.entity';
import { ApiBody, ApiTags } from '@nestjs/swagger';
import { CheckExamAttemptDetail } from './dto/check-examattemptdetail';
import { SuccessMessages } from 'src/common/constants/success-messages';

@ApiTags('ExamAttemptDetails')
@Controller('exam-attempt-details')
export class ExamAttemptDetailController {
    constructor(
        private readonly examAttemptDetailService: ExamAttemptDetailService,
    ) {}

    @Post('check-answer')
    @ApiBody({ type: [CheckExamAttemptDetail] })
    async checkAnswerAttemptDetail(
        @Body() checkExamAttemptDetail: CheckExamAttemptDetail[],
    ) {
        try {
            const examAttemptDetail = await this.examAttemptDetailService.check(
                checkExamAttemptDetail,
            );

            return ResponseHelper.success(
                HttpStatus.CREATED,
                examAttemptDetail,
                SuccessMessages.create('ExamAttemptDetail'),
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
