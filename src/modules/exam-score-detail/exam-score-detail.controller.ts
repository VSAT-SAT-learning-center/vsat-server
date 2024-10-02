import { Controller, Get, Post, Body, Param, Delete, Query, Put, HttpStatus } from '@nestjs/common';
import { CreateExamScoreDetailDto } from './dto/create-examscoredetail.dto';
import { UpdateExamScoreDetailDto } from './dto/update-examscoredetail.dto';
import { ExamScoreDetailService } from './exam-score-detail.service';
import { PaginationOptionsDto } from 'src/common/dto/pagination-options.dto.ts';
import { ResponseHelper } from 'src/common/helpers/response.helper';
import { BaseController } from '../base/base.controller';
import { ExamScoreDetail } from 'src/database/entities/examscoredetail.entity';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('ExamScoreDetails')
@Controller('exam-score-details')
export class ExamScoreDetailController extends BaseController<ExamScoreDetail> {
  constructor(examScoreDetailService: ExamScoreDetailService) {
    super(examScoreDetailService, 'ExamScoreDetail'); // Pass service and entity name to BaseController
  }
}
