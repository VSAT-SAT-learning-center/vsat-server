import { Controller, Get, Post, Body, Param, Patch, Delete, HttpStatus, Query } from '@nestjs/common';
import { LessonService } from './lesson.service';
import { CreateLessonDto } from './dto/create-lesson.dto';
import { UpdateLessonDto } from './dto/update-lesson.dto';
import { ResponseHelper } from 'src/common/helpers/response.helper';
import { SuccessMessages } from 'src/common/constants/success-messages';
import { PaginationOptionsDto } from 'src/common/dto/pagination-options.dto.ts';
import { BaseController } from '../base/base.controller';
import { Lesson } from 'src/database/entities/lesson.entity';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Lessons')
@Controller('lessons')
export class LessonController extends BaseController<Lesson> {
  constructor(lessonService: LessonService) {
    super(lessonService, 'Lesson');
  }
}