import { Controller, Get, Post, Body, Param, Delete, Query, Put, HttpStatus } from '@nestjs/common';
import { ExamScoreService } from './exam-score.service';
import { PaginationOptionsDto } from 'src/common/dto/pagination-options.dto.ts';
import { ResponseHelper } from 'src/common/helpers/response.helper';
import { CreateExamScoreDto } from './dto/create-examscore.dto';
import { UpdateExamScoreDto } from './dto/update-examscore.dto';
import { ApiTags } from '@nestjs/swagger';
import { BaseController } from '../base/base.controller';
import { ExamScore } from 'src/database/entities/examscore.entity';

@ApiTags('ExamScores')
@Controller('exam-scores')
export class ExamScoreController extends BaseController<ExamScore> {
  constructor(examScoreService: ExamScoreService) {
    super(examScoreService, 'ExamScore'); // Pass ExamScore service and entity name to BaseController
  }
}
