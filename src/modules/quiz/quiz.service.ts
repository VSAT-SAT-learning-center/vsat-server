import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PaginationOptionsDto } from 'src/common/dto/pagination-options.dto.ts';
import { PaginationService } from 'src/common/helpers/pagination.service';
import { Quiz } from 'src/database/entities/quiz.entity';
import { Repository } from 'typeorm';
import { CreateQuizDto } from './dto/create-quiz.dto';
import { UpdateQuizDto } from './dto/update-quiz.dto';
import { BaseService } from '../base/base.service';

@Injectable()
export class QuizService extends BaseService<Quiz> {
  constructor(
    @InjectRepository(Quiz)
    quizRepository: Repository<Quiz>,
    paginationService: PaginationService,
  ) {
    super(quizRepository, paginationService);
  }
}
