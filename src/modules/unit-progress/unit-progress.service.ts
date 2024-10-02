import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateUnitProgressDto } from './dto/create-unitprogress.dto';
import { UpdateUnitProgressDto } from './dto/update-unitprogress.dto';
import { UnitProgress } from 'src/database/entities/unitprogress.entity';
import { PaginationService } from 'src/common/helpers/pagination.service';
import { PaginationOptionsDto } from 'src/common/dto/pagination-options.dto.ts';

@Injectable()
export class UnitProgressService {
  constructor(
    @InjectRepository(UnitProgress)
    private readonly unitProgressRepository: Repository<UnitProgress>,
    private readonly paginationService: PaginationService,
  ) {}

  async findAll(paginationOptions: PaginationOptionsDto) {
    const { page, pageSize, sortBy, sortOrder } = paginationOptions;

    const unitProgresses = await this.unitProgressRepository.find({
      relations: ['studyProfile', 'unit'],
    });

    const sortedUnitProgresses = this.paginationService.sort(unitProgresses, sortBy, sortOrder);
    const { data, totalItems, totalPages } = this.paginationService.paginate(
      sortedUnitProgresses,
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
    return await this.unitProgressRepository.findOne({ 
      where: { id },
      relations: ['studyProfile', 'unit'] });
  }

  async create(createUnitProgressDto: CreateUnitProgressDto) {
    const unitProgress = this.unitProgressRepository.create(createUnitProgressDto);
    return await this.unitProgressRepository.save(unitProgress);
  }

  async update(id: string, updateUnitProgressDto: UpdateUnitProgressDto) {
    await this.unitProgressRepository.update(id, updateUnitProgressDto);
    return await this.findOne(id);
  }

  async remove(id: string) {
    await this.unitProgressRepository.delete(id);
    return { deleted: true };
  }
}
