import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateUnitProgressDto } from './dto/create-unitprogress.dto';
import { UpdateUnitProgressDto } from './dto/update-unitprogress.dto';
import { UnitProgress } from 'src/database/entities/unitprogress.entity';
import { PaginationService } from 'src/common/helpers/pagination.service';
import { PaginationOptionsDto } from 'src/common/dto/pagination-options.dto.ts';
import { BaseService } from '../base/base.service';

@Injectable()
export class UnitProgressService extends BaseService<UnitProgress> {
  constructor(
    @InjectRepository(UnitProgress)
    unitProgressRepository: Repository<UnitProgress>,
    paginationService: PaginationService, // Inject the PaginationService
  ) {
    super(unitProgressRepository, paginationService); // Call super with repository and paginationService
  }
}
