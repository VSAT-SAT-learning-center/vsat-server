import { Controller, Get, Post, Body, Param, Delete, Query, Put, HttpStatus } from '@nestjs/common';
import { CreateExamTypeDto } from './dto/create-examtype.dto';
import { UpdateExamTypeDto } from './dto/update-examtype.dto';
import { ExamTypeService } from './exam-type.service';
import { PaginationOptionsDto } from 'src/common/dto/pagination-options.dto.ts';
import { ResponseHelper } from 'src/common/helpers/response.helper';
import { ApiTags } from '@nestjs/swagger';
import { BaseController } from '../base/base.controller';
import { ExamType } from 'src/database/entities/examtype.entity';

@ApiTags('ExamTypes')
@Controller('exam-types')
export class ExamTypeController extends BaseController<ExamType> {
  constructor(examTypeService: ExamTypeService) {
    super(examTypeService, 'ExamType'); // Pass service and entity name to BaseController
  }
}
