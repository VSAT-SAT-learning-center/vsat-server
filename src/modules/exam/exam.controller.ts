import { Controller, Get, Post, Body, Param, Delete, Query, Put, HttpStatus } from '@nestjs/common';
import { ExamService } from './exam.service';
import { CreateExamDto } from './dto/create-exam.dto';
import { UpdateExamDto } from './dto/update-exam.dto';
import { PaginationOptionsDto } from 'src/common/dto/pagination-options.dto.ts';
import { ResponseHelper } from 'src/common/helpers/response.helper';
import { Exam } from 'src/database/entities/exam.entity';
import { BaseController } from '../base/base.controller';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Exams')
@Controller('exams')
export class ExamController extends BaseController<Exam> {
  constructor(examService: ExamService) {
    super(examService, 'Exam');
  }
}