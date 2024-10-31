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
import { CreateExamScoreDetailDto } from './dto/create-examscoredetail.dto';
import { UpdateExamScoreDetailDto } from './dto/update-examscoredetail.dto';
import { ExamScoreDetailService } from './exam-score-detail.service';
import { PaginationOptionsDto } from 'src/common/dto/pagination-options.dto.ts';
import { ResponseHelper } from 'src/common/helpers/response.helper';
import { BaseController } from '../base/base.controller';
import { ExamScoreDetail } from 'src/database/entities/examscoredetail.entity';
import { ApiBody, ApiTags } from '@nestjs/swagger';

@ApiTags('ExamScoreDetails')
@Controller('exam-score-details')
export class ExamScoreDetailController {
    constructor(
        private readonly examScoreDetailService: ExamScoreDetailService,
    ) {
    }

    // @Post()
    // @ApiBody({ type: CreateExamScoreDetailDto, isArray: true })
    // async createMany(
    //     @Body() createExamScoreDetailsDto: CreateExamScoreDetailDto[],
    // ) {
    //     try {
    //         const createdExamScoreDetails =
    //             await this.examScoreDetailService.createMany(
    //                 createExamScoreDetailsDto,
    //             );
    //         return ResponseHelper.success(
    //             HttpStatus.CREATED,
    //             createdExamScoreDetails,
    //             'Exam score details created successfully',
    //         );
    //     } catch (error) {
    //         throw new HttpException(
    //             {
    //                 statusCode: error.status || HttpStatus.BAD_REQUEST,
    //                 message: error.message || 'An error occurred',
    //             },
    //             error.status || HttpStatus.BAD_REQUEST,
    //         );
    //     }
    // }
}
