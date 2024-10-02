import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Unit } from 'src/database/entities/unit.entity';
import { Repository } from 'typeorm';
import { CreateUnitDto } from './dto/create-unit.dto';
import { UpdateUnitDto } from './dto/update-unit.dto';
import { PaginationOptionsDto } from 'src/common/dto/pagination-options.dto.ts';
import { BaseService } from '../base/base.service';
import { PaginationService } from 'src/common/helpers/pagination.service';

@Injectable()
export class UnitService extends BaseService<Unit> {
  constructor(
    @InjectRepository(Unit)
    unitRepository: Repository<Unit>,
    paginationService: PaginationService,
  ) {
    super(unitRepository, paginationService);
  }
}