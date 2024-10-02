import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateExamScoreDetailDto } from './dto/create-examscoredetail.dto';
import { UpdateExamScoreDetailDto } from './dto/update-examscoredetail.dto';
import { ExamScoreDetail } from 'src/database/entities/examscoredetail.entity';
import { PaginationService } from 'src/common/helpers/pagination.service';
import { PaginationOptionsDto } from 'src/common/dto/pagination-options.dto.ts';

@Injectable()
export class ExamScoreDetailService {
  constructor(
    @InjectRepository(ExamScoreDetail)
    private readonly examScoreDetailRepository: Repository<ExamScoreDetail>,
    private readonly paginationService: PaginationService,
  ) {}

  async findAll(paginationOptions: PaginationOptionsDto) {
    const { page, pageSize, sortBy, sortOrder } = paginationOptions;

    const examScoreDetails = await this.examScoreDetailRepository.find({
      relations: ['examScore', 'section'],
    });

    const sortedExamScoreDetails = this.paginationService.sort(examScoreDetails, sortBy, sortOrder);
    const { data, totalItems, totalPages } = this.paginationService.paginate(
      sortedExamScoreDetails,
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
    return await this.examScoreDetailRepository.findOne(id, { relations: ['examScore', 'section'] });
  }

  async create(createExamScoreDetailDto: CreateExamScoreDetailDto) {
    const examScoreDetail = this.examScoreDetailRepository.create(createExamScoreDetailDto);
    return await this.examScoreDetailRepository.save(examScoreDetail);
  }

  async update(id: string, updateExamScoreDetailDto: UpdateExamScoreDetailDto) {
    await this.examScoreDetailRepository.update(id, updateExamScoreDetailDto);
    return await this.findOne(id);
  }

  async remove(id: string) {
    await this.examScoreDetailRepository.delete(id);
    return { deleted: true };
  }
}
