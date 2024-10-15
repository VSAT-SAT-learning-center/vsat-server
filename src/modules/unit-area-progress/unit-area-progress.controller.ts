import { Controller, Get, Post, Body, Param, Delete, Query, Put, HttpStatus } from '@nestjs/common';
import { CreateUnitAreaProgressDto } from './dto/create-unitareaprogress.dto';
import { UpdateUnitAreaProgressDto } from './dto/update-unitareaprogress.dto';
import { UnitAreaProgressService } from './unit-area-progress.service';
import { PaginationOptionsDto } from 'src/common/dto/pagination-options.dto.ts';
import { ResponseHelper } from 'src/common/helpers/response.helper';
import { ApiTags } from '@nestjs/swagger';
import { BaseController } from '../base/base.controller';
import { UnitAreaProgress } from 'src/database/entities/unitareaprogress.entity';

@ApiTags('UnitAreaProgress')
@Controller('unit-area-progress')
export class UnitAreaProgressController extends BaseController<UnitAreaProgress> {
  constructor(unitAreaProgressService: UnitAreaProgressService) {
    super(unitAreaProgressService, 'UnitAreaProgress');
  }
}
