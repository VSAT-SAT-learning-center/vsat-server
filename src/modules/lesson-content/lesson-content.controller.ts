import { Controller, Get, Post, Body, Param, Patch, Delete, HttpStatus } from '@nestjs/common';
import { LessonContentService } from './lesson-content.service';
import { CreateLessonContentDto } from './dto/create-lessoncontent.dto';
import { UpdateLessonContentDto } from './dto/update-lessoncontent.dto';
import { ResponseHelper } from 'src/common/helpers/response.helper';
import { SuccessMessages } from 'src/common/constants/success-messages';
import { BaseController } from '../base/base.controller';
import { LessonContent } from 'src/database/entities/lessoncontent.entity';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('LessonContents')
@Controller('lesson-contents')
export class LessonContentController extends BaseController<LessonContent> {
  constructor(lessonContentService: LessonContentService) {
    super(lessonContentService, 'LessonContent');
  }
}