import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PaginationOptionsDto } from 'src/common/dto/pagination-options.dto.ts';
import { PaginationService } from 'src/common/helpers/pagination.service';
import { ExamScore } from 'src/database/entities/examscore.entity';
import { Repository } from 'typeorm';
import { UpdateExamScoreDto } from './dto/update-examscore.dto';
import { CreateExamScoreDto } from './dto/create-examscore.dto';
@Injectable()
export class ExamScoreService {
  constructor(
    @InjectRepository(ExamScore)
    private readonly examScoreRepository: Repository<ExamScore>,
    private readonly paginationService: PaginationService,
  ) {}

  async findAll(paginationOptions: PaginationOptionsDto) {
    const { page, pageSize, sortBy, sortOrder } = paginationOptions;

    const examScores = await this.examScoreRepository.find({
      relations: ['examStructure'],
    });

    const sortedExamScores = this.paginationService.sort(examScores, sortBy, sortOrder);
    const { data, totalItems, totalPages } = this.paginationService.paginate(
      sortedExamScores,
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
    return await this.examScoreRepository.findOne({ 
      where: { id },
      relations: ['examStructure'] });
  }

  async create(createExamScoreDto: CreateExamScoreDto) {
    const examScore = this.examScoreRepository.create(createExamScoreDto);
    return await this.examScoreRepository.save(examScore);
  }

  async update(id: string, updateExamScoreDto: UpdateExamScoreDto) {
    await this.examScoreRepository.update(id, updateExamScoreDto);
    return await this.findOne(id);
  }

  async remove(id: string) {
    await this.examScoreRepository.delete(id);
    return { deleted: true };
  }
}
