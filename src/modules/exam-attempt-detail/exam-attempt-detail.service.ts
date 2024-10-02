import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateExamAttemptDetailDto } from './dto/create-examattemptdetail.dto';
import { UpdateExamAttemptDetailDto } from './dto/update-examattemptdetail.dto';
import { ExamAttemptDetail } from 'src/database/entities/examattemptdetail.entity';
import { PaginationOptionsDto } from 'src/common/dto/pagination-options.dto.ts';

@Injectable()
export class ExamAttemptDetailService {
  constructor(
    @InjectRepository(ExamAttemptDetail)
    private readonly examAttemptDetailRepository: Repository<ExamAttemptDetail>,
  ) {}

  async findAll(paginationOptions: PaginationOptionsDto) {
    const { page, pageSize, sortBy, sortOrder } = paginationOptions;
    const skip = (page - 1) * pageSize;

    const queryBuilder = this.examAttemptDetailRepository.createQueryBuilder('examattemptdetail')
      .leftJoinAndSelect('examattemptdetail.examAttempt', 'examAttempt')
      .leftJoinAndSelect('examattemptdetail.question', 'question')
      .orderBy(`examattemptdetail.${sortBy}`, sortOrder)
      .skip(skip)
      .take(pageSize);

    const [data, totalItems] = await queryBuilder.getManyAndCount();

    return {
      data,
      totalItems,
      totalPages: Math.ceil(totalItems / pageSize),
    };
  }

  async findOne(id: string) {
    return await this.examAttemptDetailRepository.findOne({ 
      where: {id},
      relations: ['examAttempt', 'question'] });
  }

  async create(createExamAttemptDetailDto: CreateExamAttemptDetailDto) {
    const examAttemptDetail = this.examAttemptDetailRepository.create(createExamAttemptDetailDto);
    return await this.examAttemptDetailRepository.save(examAttemptDetail);
  }

  async update(id: string, updateExamAttemptDetailDto: UpdateExamAttemptDetailDto) {
    await this.examAttemptDetailRepository.update(id, updateExamAttemptDetailDto);
    return await this.findOne(id);
  }

  async remove(id: string) {
    await this.examAttemptDetailRepository.delete(id);
    return { deleted: true };
  }
}
