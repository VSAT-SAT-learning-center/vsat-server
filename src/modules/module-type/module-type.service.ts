import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateModuleTypeDto } from './dto/create-moduletype.dto';
import { UpdateModuleTypeDto } from './dto/update-moduletype.dto';
import { ModuleType } from 'src/database/entities/moduletype.entity';
import { PaginationService } from 'src/common/helpers/pagination.service';
import { PaginationOptionsDto } from 'src/common/dto/pagination-options.dto.ts';

@Injectable()
export class ModuleTypeService {
  constructor(
    @InjectRepository(ModuleType)
    private readonly moduleTypeRepository: Repository<ModuleType>,
    private readonly paginationService: PaginationService,
  ) {}

  async findAll(paginationOptions: PaginationOptionsDto) {
    const { page, pageSize, sortBy, sortOrder } = paginationOptions;

    const moduleTypes = await this.moduleTypeRepository.find({
      relations: ['section', 'examStructure'],
    });

    const sortedModuleTypes = this.paginationService.sort(moduleTypes, sortBy, sortOrder);
    const { data, totalItems, totalPages } = this.paginationService.paginate(
      sortedModuleTypes,
      page,
      pageSize,
    );

    return {
      data,
      totalItems,
      totalPages,
    };
  }

  async findOne(id: string) {
    return await this.moduleTypeRepository.findOne({ 
      where: { id },
      relations: ['section', 'examStructure'] });
  }

  async create(createModuleTypeDto: CreateModuleTypeDto) {
    const moduleType = this.moduleTypeRepository.create(createModuleTypeDto);
    return await this.moduleTypeRepository.save(moduleType);
  }

  async update(id: string, updateModuleTypeDto: UpdateModuleTypeDto) {
    await this.moduleTypeRepository.update(id, updateModuleTypeDto);
    return await this.findOne(id);
  }

  async remove(id: string) {
    await this.moduleTypeRepository.delete(id);
    return { deleted: true };
  }
}
