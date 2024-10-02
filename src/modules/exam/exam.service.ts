import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateExamDto } from './dto/create-exam.dto';
import { UpdateExamDto } from './dto/update-exam.dto';
import { Exam } from 'src/database/entities/exam.entity';
import { PaginationOptionsDto } from 'src/common/dto/pagination-options.dto.ts';

@Injectable()
export class ExamService {
  constructor(
    @InjectRepository(Exam)
    private readonly examRepository: Repository<Exam>,
  ) {}

  async findAll(paginationOptions: PaginationOptionsDto) {
    const { page, pageSize, sortBy, sortOrder } = paginationOptions;
    const skip = (page - 1) * pageSize;

    const queryBuilder = this.examRepository.createQueryBuilder('exam')
      .leftJoinAndSelect('exam.examStructure', 'examStructure')
      .leftJoinAndSelect('exam.examType', 'examType')
      .orderBy(`exam.${sortBy}`, sortOrder)
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
    return await this.examRepository.findOne({ 
      where: { id },
      relations: ['examStructure', 'examType'] });
  }

  async create(createExamDto: CreateExamDto) {
    const exam = this.examRepository.create(createExamDto);
    return await this.examRepository.save(exam);
  }

  async update(id: string, updateExamDto: UpdateExamDto) {
    await this.examRepository.update(id, updateExamDto);
    return await this.findOne(id);
  }

  async remove(id: string) {
    await this.examRepository.delete(id);
    return { deleted: true };
  }
}
