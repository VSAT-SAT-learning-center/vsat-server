import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ExamStructure } from './examstructure.entity';
import { CreateExamStructureDto } from './dto/create-examstructure.dto';
import { UpdateExamStructureDto } from './dto/update-examstructure.dto';
import { PaginationOptionsDto } from '../common/dto/pagination-options.dto';
import { PaginationService } from '../common/pagination.service';

@Injectable()
export class ExamStructureService {
  constructor(
    @InjectRepository(ExamStructure)
    private readonly examStructureRepository: Repository<ExamStructure>,
    private readonly paginationService: PaginationService,
  ) {}

  async findAll(paginationOptions: PaginationOptionsDto) {
    const { page, pageSize, sortBy, sortOrder } = paginationOptions;

    const examStructures = await this.examStructureRepository.find();

    const sortedExamStructures = this.paginationService.sort(examStructures, sortBy, sortOrder);
    const { data, totalItems, totalPages } = this.paginationService.paginate(
      sortedExamStructures,
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
    return await this.examStructureRepository.findOne(id);
  }

  async create(createExamStructureDto: CreateExamStructureDto) {
    const examStructure = this.examStructureRepository.create(createExamStructureDto);
    return await this.examStructureRepository.save(examStructure);
  }

  async update(id: string, updateExamStructureDto: UpdateExamStructureDto) {
    await this.examStructureRepository.update(id, updateExamStructureDto);
    return await this.findOne(id);
  }

  async remove(id: string) {
    await this.examStructureRepository.delete(id);
    return { deleted: true };
  }
}
