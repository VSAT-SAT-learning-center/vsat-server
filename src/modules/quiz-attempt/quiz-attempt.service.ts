import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateQuizAttemptDto } from './dto/create-quizattempt.dto';
import { UpdateQuizAttemptDto } from './dto/update-quizattempt.dto';
import { QuizAttempt } from 'src/database/entities/quizattempt.entity';
import { PaginationService } from 'src/common/helpers/pagination.service';
import { PaginationOptionsDto } from 'src/common/dto/pagination-options.dto.ts';

@Injectable()
export class QuizAttemptService {
  constructor(
    @InjectRepository(QuizAttempt)
    private readonly quizAttemptRepository: Repository<QuizAttempt>,
    private readonly paginationService: PaginationService,
  ) {}

  async findAll(paginationOptions: PaginationOptionsDto) {
    const { page, pageSize, sortBy, sortOrder } = paginationOptions;

    const quizAttempts = await this.quizAttemptRepository.find({
      relations: ['studyProfile', 'quiz'],
    });

    const sortedQuizAttempts = this.paginationService.sort(quizAttempts, sortBy, sortOrder);
    const { data, totalItems, totalPages } = this.paginationService.paginate(
      sortedQuizAttempts,
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
    return await this.quizAttemptRepository.findOne({ 
      where: { id },
      relations: ['studyProfile', 'quiz'] });
  }

  async create(createQuizAttemptDto: CreateQuizAttemptDto) {
    const quizAttempt = this.quizAttemptRepository.create(createQuizAttemptDto);
    return await this.quizAttemptRepository.save(quizAttempt);
  }

  async update(id: string, updateQuizAttemptDto: UpdateQuizAttemptDto) {
    await this.quizAttemptRepository.update(id, updateQuizAttemptDto);
    return await this.findOne(id);
  }

  async remove(id: string) {
    await this.quizAttemptRepository.delete(id);
    return { deleted: true };
  }
}
