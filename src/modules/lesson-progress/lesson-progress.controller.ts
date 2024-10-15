import { Controller, Get, Post, Body, Param, Delete, Query, Put, HttpStatus, Patch } from '@nestjs/common';
import { CreateLessonProgressDto } from './dto/create-lessonprogress.dto';
import { UpdateLessonProgressDto } from './dto/update-lessonprogress.dto';
import { LessonProgressService } from './lesson-progress.service';
import { PaginationOptionsDto } from 'src/common/dto/pagination-options.dto.ts';
import { ResponseHelper } from 'src/common/helpers/response.helper';
import { LessonProgress } from 'src/database/entities/lessonprogress.entity';
import { BaseController } from '../base/base.controller';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('LessonProgress')
@Controller('lesson-progress')
export class LessonProgressController extends BaseController<LessonProgress> {
  constructor(private readonly lessonProgressService: LessonProgressService) {
    super(lessonProgressService, 'LessonProgress');
  }
  
  @Patch(':unitAreaProgressId/:lessonId')
  async updateLessonProgress(
    @Param('unitAreaProgressId') unitAreaProgressId: string,
    @Param('lessonId') lessonId: string,
    @Body('progress') progress: number
  ): Promise<LessonProgress> {
    return this.lessonProgressService.updateLessonProgress(unitAreaProgressId, lessonId, progress);
  }
  
}