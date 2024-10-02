import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateUnitAreaProgressDto } from './dto/create-unitareaprogress.dto';
import { UpdateUnitAreaProgressDto } from './dto/update-unitareaprogress.dto';
import { UnitAreaProgress } from 'src/database/entities/unitareaprogress.entity';
import { PaginationService } from 'src/common/helpers/pagination.service';
import { PaginationOptionsDto } from 'src/common/dto/pagination-options.dto.ts';

@Injectable()
export class UnitAreaProgressService {
  constructor(
    @InjectRepository(UnitAreaProgress)
    private readonly unitAreaProgressRepository: Repository<UnitAreaProgress>,
    private readonly paginationService: PaginationService,
  ) {}

  async findAll(paginationOptions: PaginationOptionsDto) {
    const { page, pageSize, sortBy, sortOrder } = paginationOptions;

    const unitAreaProgresses = await this.unitAreaProgressRepository.find({
      relations: ['unitArea', 'unitProgress'],
    });

    const sortedUnitAreaProgresses = this.paginationService.sort(unitAreaProgresses, sortBy, sortOrder);
    const { data, totalItems, totalPages } = this.paginationService.paginate(
      sortedUnitAreaProgresses,
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
    return await this.unitAreaProgressRepository.findOne({
      where: { id },
      relations: ['unitArea', 'unitProgress'],
    });
  }

  async create(createUnitAreaProgressDto: CreateUnitAreaProgressDto) {
    const unitAreaProgress = this.unitAreaProgressRepository.create(createUnitAreaProgressDto);
    return await this.unitAreaProgressRepository.save(unitAreaProgress);
  }

  async update(id: string, updateUnitAreaProgressDto: UpdateUnitAreaProgressDto) {
    await this.unitAreaProgressRepository.update(id, updateUnitAreaProgressDto);
    return await this.findOne(id);
  }

  async remove(id: string) {
    await this.unitAreaProgressRepository.delete(id);
    return { deleted: true };
  }
}
