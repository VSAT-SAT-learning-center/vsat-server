import { Controller, Get, Post, Body, Param, Delete, Query, Put, HttpStatus } from '@nestjs/common';
import { CreateExamStructureDto } from './dto/create-examstructure.dto';
import { UpdateExamStructureDto } from './dto/update-examstructure.dto';
import { ApiTags } from '@nestjs/swagger';
import { BaseController } from '../base/base.controller';
import { ExamStructure } from 'src/database/entities/examstructure.entity';
import { ExamStructureService } from './exam-structure.service';

@ApiTags('ExamStructures')
@Controller('exam-structures')
export class ExamStructureController extends BaseController<ExamStructure> {
  constructor(examStructureService: ExamStructureService) {
    super(examStructureService, 'ExamStructure'); // Pass service and entity name to BaseController
  }
}
