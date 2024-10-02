import { Controller, Get, Post, Body, Param, Patch, Delete, HttpStatus } from '@nestjs/common';
import { CreateUnitAreaDto } from './dto/create-unitarea.dto';
import { UpdateUnitAreaDto } from './dto/update-unitarea.dto';
import { UnitAreaService } from './unit-area.service';
import { SuccessMessages } from 'src/common/constants/success-messages';
import { ResponseHelper } from 'src/common/helpers/response.helper';
import { BaseController } from '../base/base.controller';
import { UnitArea } from 'src/database/entities/unitarea.entity';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('UnitAreas')
@Controller('unit-areas')
export class UnitAreaController extends BaseController<UnitArea> {
  constructor(unitAreaService: UnitAreaService) {
    super(unitAreaService, 'UnitArea');
  }
}