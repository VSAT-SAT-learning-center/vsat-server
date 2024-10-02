import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateTargetLearningDto } from './dto/create-targetlearning.dto';
import { UpdateTargetLearningDto } from './dto/update-targetlearning.dto';
import { TargetLearning } from 'src/database/entities/targetlearning.entity';
import { PaginationService } from 'src/common/helpers/pagination.service';
import { PaginationOptionsDto } from 'src/common/dto/pagination-options.dto.ts';

@Injectable()
export class TargetLearningService {
  constructor(
    @InjectRepository(TargetLearning)
    private readonly targetLearningRepository: Repository<TargetLearning>,
    private readonly paginationService: PaginationService,
  ) {}

  async findAll(paginationOptions: PaginationOptionsDto) {
    const { page, pageSize, sortBy, sortOrder } = paginationOptions;

    const targetLearnings = await this.targetLearningRepository.find({
      relations: ['level', 'section', 'studyProfile'],
    });

    const sortedTargetLearnings = this.paginationService.sort(targetLearnings, sortBy, sortOrder);
    const { data, totalItems, totalPages } = this.paginationService.paginate(
      sortedTargetLearnings,
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
    return await this.targetLearningRepository.findOne({
      where: { id },
      relations: ['level', 'section', 'studyProfile'],
    });
  }

  async create(createTargetLearningDto: CreateTargetLearningDto) {
    const targetLearning = this.targetLearningRepository.create(createTargetLearningDto);
    return await this.targetLearningRepository.save(targetLearning);
  }

  async update(id: string, updateTargetLearningDto: UpdateTargetLearningDto) {
    await this.targetLearningRepository.update(id, updateTargetLearningDto);
    return await this.findOne(id);
  }

  async remove(id: string) {
    await this.targetLearningRepository.delete(id);
    return { deleted: true };
  }
}
