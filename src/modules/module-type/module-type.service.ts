import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateModuleTypeDto } from './dto/create-moduletype.dto';
import { UpdateModuleTypeDto } from './dto/update-moduletype.dto';
import { ModuleType } from 'src/database/entities/moduletype.entity';
import { PaginationService } from 'src/common/helpers/pagination.service';
import { PaginationOptionsDto } from 'src/common/dto/pagination-options.dto.ts';
import { BaseService } from '../base/base.service';

@Injectable()
export class ModuleTypeService extends BaseService<ModuleType> {
  constructor(
    @InjectRepository(ModuleType)
    moduleTypeRepository: Repository<ModuleType>,
    paginationService: PaginationService,
  ) {
    super(moduleTypeRepository, paginationService);
  }
}