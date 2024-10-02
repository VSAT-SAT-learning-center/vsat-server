import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateUnitLevelDto } from './dto/create-unitlevel.dto';
import { UpdateUnitLevelDto } from './dto/update-unitlevel.dto';
import { UnitLevel } from 'src/database/entities/unitlevel.entity';
import { PaginationService } from 'src/common/helpers/pagination.service';
import { PaginationOptionsDto } from 'src/common/dto/pagination-options.dto.ts';

@Injectable()
export class UnitLevelService {
  constructor(
    @InjectRepository(UnitLevel)
    private readonly unitLevelRepository: Repository<UnitLevel>,
    private readonly paginationService: PaginationService,
  ) {}

  async findAll(paginationOptions: PaginationOptionsDto) {
    const { page, pageSize, sortBy, sortOrder } = paginationOptions;

    const unitLevels = await this.unitLevelRepository.find({
      relations: ['unit', 'level'],
    });

    const sortedUnitLevels = this.paginationService.sort(unitLevels, sortBy, sortOrder);
    const { data, totalItems, totalPages } = this.paginationService.paginate(
      sortedUnitLevels,
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
    return await this.unitLevelRepository.findOne({ 
      where: { id }, 
      relations: ['unit', 'level'] });
  }

  async create(createUnitLevelDto: CreateUnitLevelDto) {
    const unitLevel = this.unitLevelRepository.create(createUnitLevelDto);
    return await this.unitLevelRepository.save(unitLevel);
  }

  async update(id: string, updateUnitLevelDto: UpdateUnitLevelDto) {
    await this.unitLevelRepository.update(id, updateUnitLevelDto);
    return await this.findOne(id);
  }

  async remove(id: string) {
    await this.unitLevelRepository.delete(id);
    return { deleted: true };
  }
}
