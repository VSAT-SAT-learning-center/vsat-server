import {
    Controller,
    Get,
    Post,
    Body,
    Param,
    Patch,
    Delete,
    HttpStatus,
    Query,
} from '@nestjs/common';
import { UnitService } from './unit.service';
import { CreateUnitDto } from './dto/create-unit.dto';
import { UpdateUnitDto } from './dto/update-unit.dto'; // Import SuccessMessages
import { SuccessMessages } from 'src/common/constants/success-messages';
import { ResponseHelper } from 'src/common/helpers/response.helper';
import { ApiTags } from '@nestjs/swagger';
import { PaginationOptionsDto } from 'src/common/dto/pagination-options.dto.ts';
import { BaseController } from '../base/base.controller';
import { Unit } from 'src/database/entities/unit.entity';

@ApiTags('Units')
@Controller('units')
export class UnitController extends BaseController<Unit> {
  constructor(unitService: UnitService) {
    super(unitService, 'Unit');
  }
}
