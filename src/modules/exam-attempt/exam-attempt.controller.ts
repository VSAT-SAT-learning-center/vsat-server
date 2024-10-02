import { Controller, Get, Post, Body, Param, Delete, Query, Put, HttpStatus } from '@nestjs/common';
import { CreateExamAttemptDto } from './dto/create-examattempt.dto';
import { UpdateExamAttemptDto } from './dto/update-examattempt.dto';
import { ExamAttemptService } from './exam-attempt.service';
import { PaginationOptionsDto } from 'src/common/dto/pagination-options.dto.ts';
import { ResponseHelper } from 'src/common/helpers/response.helper';
import { BaseController } from '../base/base.controller';
import { ExamAttempt } from 'src/database/entities/examattempt.entity';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('ExamAttempts')
@Controller('exam-attempts')
export class ExamAttemptController extends BaseController<ExamAttempt> {
  constructor(examAttemptService: ExamAttemptService) {
    super(examAttemptService, 'ExamAttempt');
  }
}
