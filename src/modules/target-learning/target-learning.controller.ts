import { Controller, Get, Post, Body, Param, Delete, Query, Put, HttpStatus } from '@nestjs/common';
import { CreateTargetLearningDto } from './dto/create-targetlearning.dto';
import { UpdateTargetLearningDto } from './dto/update-targetlearning.dto';
import { TargetLearningService } from './target-learning.service';
import { PaginationOptionsDto } from 'src/common/dto/pagination-options.dto.ts';
import { ResponseHelper } from 'src/common/helpers/response.helper';
import { BaseController } from '../base/base.controller';
import { TargetLearning } from 'src/database/entities/targetlearning.entity';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('TargetLearnings')
@Controller('target-learnings')
export class TargetLearningController extends BaseController<TargetLearning> {
  constructor(targetLearningService: TargetLearningService) {
    super(targetLearningService, 'TargetLearning');
  }
}

