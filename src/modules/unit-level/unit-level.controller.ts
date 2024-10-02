import { Controller, Get, Post, Body, Param, Delete, Query, Put, HttpStatus } from '@nestjs/common';
import { CreateUnitLevelDto } from './dto/create-unitlevel.dto';
import { UpdateUnitLevelDto } from './dto/update-unitlevel.dto';
import { UnitLevelService } from './unit-level.service';
import { PaginationOptionsDto } from 'src/common/dto/pagination-options.dto.ts';
import { ResponseHelper } from 'src/common/helpers/response.helper';
import { ApiTags } from '@nestjs/swagger';
import { BaseController } from '../base/base.controller';
import { UnitLevel } from 'src/database/entities/unitlevel.entity';

@ApiTags('UnitLevels')
@Controller('unit-levels')
export class UnitLevelController extends BaseController<UnitLevel> {
  constructor(unitLevelService: UnitLevelService) {
    super(unitLevelService, 'UnitLevel');
  }
}
