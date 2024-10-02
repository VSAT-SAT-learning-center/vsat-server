import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateUnitAreaProgressDto } from './dto/create-unitareaprogress.dto';
import { UpdateUnitAreaProgressDto } from './dto/update-unitareaprogress.dto';
import { UnitAreaProgress } from 'src/database/entities/unitareaprogress.entity';
import { PaginationService } from 'src/common/helpers/pagination.service';
import { PaginationOptionsDto } from 'src/common/dto/pagination-options.dto.ts';
import { BaseService } from '../base/base.service';
//
@Injectable()
export class UnitAreaProgressService extends BaseService<UnitAreaProgress> {
  constructor(
    @InjectRepository(UnitAreaProgress)
    unitAreaProgressRepository: Repository<UnitAreaProgress>,
    paginationService: PaginationService, // Inject the PaginationService
  ) {
    super(unitAreaProgressRepository, paginationService); // Call super with repository and paginationService
  }
}
