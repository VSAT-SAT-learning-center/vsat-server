import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateQuizAttemptAnswerDto } from './dto/create-quizattemptanswer.dto';
import { UpdateQuizAttemptAnswerDto } from './dto/update-quizattemptanswer.dto';
import { QuizAttemptAnswer } from 'src/database/entities/quizattemptanswer.entity';
import { PaginationService } from 'src/common/helpers/pagination.service';
import { PaginationOptionsDto } from 'src/common/dto/pagination-options.dto.ts';
import { BaseService } from '../base/base.service';

@Injectable()
export class QuizAttemptAnswerService extends BaseService<QuizAttemptAnswer> {
  constructor(
    @InjectRepository(QuizAttemptAnswer) repository: Repository<QuizAttemptAnswer>, // Inject repository for QuizAttemptAnswer
    paginationService: PaginationService,
  ) {
    super(repository, paginationService); // Pass repository and paginationService to BaseService
  }
}