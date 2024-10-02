import { Controller, Get, Post, Body, Param, Delete, Query, Put, HttpStatus } from '@nestjs/common';
import { CreateExamAttemptDetailDto } from './dto/create-examattemptdetail.dto';
import { UpdateExamAttemptDetailDto } from './dto/update-examattemptdetail.dto';
import { ExamAttemptDetailService } from './exam-attempt-detail.service';
import { PaginationOptionsDto } from 'src/common/dto/pagination-options.dto.ts';
import { ResponseHelper } from 'src/common/helpers/response.helper';
import { BaseController } from '../base/base.controller';
import { ExamAttemptDetail } from 'src/database/entities/examattemptdetail.entity';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('ExamAttemptDetails')
@Controller('exam-attempt-details')
export class ExamAttemptDetailController extends BaseController<ExamAttemptDetail> {
  constructor(examAttemptDetailService: ExamAttemptDetailService) {
    super(examAttemptDetailService, 'ExamAttemptDetail');
  }
}
