import { Controller, Get, Post, Body, Param, Delete, Query, Put, HttpStatus } from '@nestjs/common';
import { CreateQuizConfigDto } from './dto/create-quizconfig.dto';
import { UpdateQuizConfigDto } from './dto/update-quizconfig.dto';
import { QuizConfigService } from './quiz-config.service';
import { PaginationOptionsDto } from 'src/common/dto/pagination-options.dto.ts';
import { ResponseHelper } from 'src/common/helpers/response.helper';
import { BaseController } from '../base/base.controller';
import { ApiTags } from '@nestjs/swagger';
import { QuizConfig } from 'src/database/entities/quizconfig.entity';

@ApiTags('QuizConfigs')
@Controller('quiz-skills')
export class QuizConfigController extends BaseController<QuizConfig> {
  constructor(QuizConfigService: QuizConfigService) {
    super(QuizConfigService, 'QuizConfig'); // Pass service and entity name to BaseController
  }
}
