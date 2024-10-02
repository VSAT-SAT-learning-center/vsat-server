import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateExamTypeDto } from './dto/create-examtype.dto';
import { UpdateExamTypeDto } from './dto/update-examtype.dto';
import { ExamType } from 'src/database/entities/examtype.entity';
import { PaginationService } from 'src/common/helpers/pagination.service';
import { PaginationOptionsDto } from 'src/common/dto/pagination-options.dto.ts';

@Injectable()
export class ExamTypeService {
  constructor(
    @InjectRepository(ExamType)
    private readonly examTypeRepository: Repository<ExamType>,
    private readonly paginationService: PaginationService,
  ) {}

  async findAll(paginationOptions: PaginationOptionsDto) {
    const { page, pageSize, sortBy, sortOrder } = paginationOptions;

    const examTypes = await this.examTypeRepository.find();

    const sortedExamTypes = this.paginationService.sort(examTypes, sortBy, sortOrder);
    const { data, totalItems, totalPages } = this.paginationService.paginate(
      sortedExamTypes,
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
    return await this.examTypeRepository.findOne(id);
  }

  async create(createExamTypeDto: CreateExamTypeDto) {
    const examType = this.examTypeRepository.create(createExamTypeDto);
    return await this.examTypeRepository.save(examType);
  }

  async update(id: string, updateExamTypeDto: UpdateExamTypeDto) {
    await this.examTypeRepository.update(id, updateExamTypeDto);
    return await this.findOne(id);
  }

  async remove(id: string) {
    await this.examTypeRepository.delete(id);
    return { deleted: true };
  }
}
