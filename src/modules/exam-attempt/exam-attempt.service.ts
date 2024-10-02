import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateExamAttemptDto } from './dto/create-examattempt.dto';
import { UpdateExamAttemptDto } from './dto/update-examattempt.dto';
import { PaginationService } from 'src/common/helpers/pagination.service';
import { ExamAttempt } from 'src/database/entities/examattempt.entity';
import { PaginationOptionsDto } from 'src/common/dto/pagination-options.dto.ts';

@Injectable()
export class ExamAttemptService {
  constructor(
    @InjectRepository(ExamAttempt)
    private readonly examAttemptRepository: Repository<ExamAttempt>,
    private readonly paginationService: PaginationService, // Inject PaginationService
  ) {}

  async findAll(paginationOptions: PaginationOptionsDto) {
    const { page, pageSize, sortBy, sortOrder } = paginationOptions;

    // Lấy tất cả các bản ghi
    const examAttempts = await this.examAttemptRepository.find({
      relations: ['studyProfile', 'exam'],
    });

    // Sắp xếp
    const sortedExamAttempts = this.paginationService.sort(examAttempts, sortBy, sortOrder);

    // Phân trang
    const { data, totalItems, totalPages } = this.paginationService.paginate(
      sortedExamAttempts,
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
    return await this.examAttemptRepository.findOne({ 
      where: { id },
      relations: ['studyProfile', 'exam'] });
  }

  async create(createExamAttemptDto: CreateExamAttemptDto) {
    const examAttempt = this.examAttemptRepository.create(createExamAttemptDto);
    return await this.examAttemptRepository.save(examAttempt);
  }

  async update(id: string, updateExamAttemptDto: UpdateExamAttemptDto) {
    await this.examAttemptRepository.update(id, updateExamAttemptDto);
    return await this.findOne(id);
  }

  async remove(id: string) {
    await this.examAttemptRepository.delete(id);
    return { deleted: true };
  }
}
