import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PaginationOptionsDto } from 'src/common/dto/pagination-options.dto.ts';
import { PaginationService } from 'src/common/helpers/pagination.service';
import { Quiz } from 'src/database/entities/quiz.entity';
import { Repository } from 'typeorm';
import { CreateQuizDto } from './dto/create-quiz.dto';
import { UpdateQuizDto } from './dto/update-quiz.dto';

@Injectable()
export class QuizService {
  constructor(
    @InjectRepository(Quiz)
    private readonly quizRepository: Repository<Quiz>,
    private readonly paginationService: PaginationService,
  ) {}

  async findAll(paginationOptions: PaginationOptionsDto) {
    const { page, pageSize, sortBy, sortOrder } = paginationOptions;

    const quizzes = await this.quizRepository.find({
      relations: ['unit'],
    });

    const sortedQuizzes = this.paginationService.sort(quizzes, sortBy, sortOrder);
    const { data, totalItems, totalPages } = this.paginationService.paginate(
      sortedQuizzes,
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
    return await this.quizRepository.findOne({ 
        where: { id },
        relations: ['unit'] });
  }

  async create(createQuizDto: CreateQuizDto) {
    const quiz = this.quizRepository.create(createQuizDto);
    return await this.quizRepository.save(quiz);
  }

  async update(id: string, updateQuizDto: UpdateQuizDto) {
    await this.quizRepository.update(id, updateQuizDto);
    return await this.findOne(id);
  }

  async remove(id: string) {
    await this.quizRepository.delete(id);
    return { deleted: true };
  }
}
