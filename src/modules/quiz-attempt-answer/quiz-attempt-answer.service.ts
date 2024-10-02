import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateQuizAttemptAnswerDto } from './dto/create-quizattemptanswer.dto';
import { UpdateQuizAttemptAnswerDto } from './dto/update-quizattemptanswer.dto';
import { QuizAttemptAnswer } from 'src/database/entities/quizattemptanswer.entity';
import { PaginationService } from 'src/common/helpers/pagination.service';
import { PaginationOptionsDto } from 'src/common/dto/pagination-options.dto.ts';

@Injectable()
export class QuizAttemptAnswerService {
  constructor(
    @InjectRepository(QuizAttemptAnswer)
    private readonly quizAttemptAnswerRepository: Repository<QuizAttemptAnswer>,
    private readonly paginationService: PaginationService,
  ) {}

  async findAll(paginationOptions: PaginationOptionsDto) {
    const { page, pageSize, sortBy, sortOrder } = paginationOptions;

    const quizAttemptAnswers = await this.quizAttemptAnswerRepository.find({
      relations: ['quizAttempt', 'quizQuestion'],
    });

    const sortedQuizAttemptAnswers = this.paginationService.sort(quizAttemptAnswers, sortBy, sortOrder);
    const { data, totalItems, totalPages } = this.paginationService.paginate(
      sortedQuizAttemptAnswers,
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
    return await this.quizAttemptAnswerRepository.findOne({ 
      where: { id },
      relations: ['quizAttempt', 'quizQuestion'] });
  }

  async create(createQuizAttemptAnswerDto: CreateQuizAttemptAnswerDto) {
    const quizAttemptAnswer = this.quizAttemptAnswerRepository.create(createQuizAttemptAnswerDto);
    return await this.quizAttemptAnswerRepository.save(quizAttemptAnswer);
  }

  async update(id: string, updateQuizAttemptAnswerDto: UpdateQuizAttemptAnswerDto) {
    await this.quizAttemptAnswerRepository.update(id, updateQuizAttemptAnswerDto);
    return await this.findOne(id);
  }

  async remove(id: string) {
    await this.quizAttemptAnswerRepository.delete(id);
    return { deleted: true };
  }
}
