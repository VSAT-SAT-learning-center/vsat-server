import { Controller } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { UpdateUnitDto } from '../unit/dto/update-unit.dto';
import { CreateUnitDto } from '../unit/dto/create-unit.dto';
import { UnitService } from '../unit/unit.service';
import { BaseController } from '../base/base.controller';
import { UnitProgress } from 'src/database/entities/unitprogress.entity';
import { UnitProgressService } from './unit-progress.service';

@ApiTags('UnitProgress')
@Controller('unit-progress')
export class UnitProgressController extends BaseController<UnitProgress> {
  constructor(unitProgressService: UnitProgressService) {
    super(unitProgressService, 'UnitProgress');
  }
}
