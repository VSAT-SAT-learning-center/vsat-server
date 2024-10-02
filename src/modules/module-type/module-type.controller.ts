import { Controller, Get, Post, Body, Param, Delete, Query, Put, HttpStatus } from '@nestjs/common';
import { CreateModuleTypeDto } from './dto/create-moduletype.dto';
import { UpdateModuleTypeDto } from './dto/update-moduletype.dto';
import { ModuleTypeService } from './module-type.service';
import { PaginationOptionsDto } from 'src/common/dto/pagination-options.dto.ts';
import { ResponseHelper } from 'src/common/helpers/response.helper';
import { ModuleType } from 'src/database/entities/moduletype.entity';
import { BaseController } from '../base/base.controller';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('ModuleType')
@Controller('module-types')
export class ModuleTypeController extends BaseController<ModuleType> {
  constructor(moduleTypeService: ModuleTypeService) {
    super(moduleTypeService, 'ModuleType');
  }
}
