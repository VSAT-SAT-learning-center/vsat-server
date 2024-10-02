import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateUnitLevelDto } from './dto/create-unitlevel.dto';
import { UpdateUnitLevelDto } from './dto/update-unitlevel.dto';
import { UnitLevel } from 'src/database/entities/unitlevel.entity';
import { PaginationService } from 'src/common/helpers/pagination.service';
import { PaginationOptionsDto } from 'src/common/dto/pagination-options.dto.ts';
import { BaseService } from '../base/base.service';

@Injectable()
export class UnitLevelService extends BaseService<UnitLevel> {
  constructor(
    @InjectRepository(UnitLevel)
    unitLevelRepository: Repository<UnitLevel>,
    paginationService: PaginationService,
  ) {
    super(unitLevelRepository, paginationService);
  }
}