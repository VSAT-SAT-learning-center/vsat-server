import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateQuizAttemptDto } from './dto/create-quizattempt.dto';
import { UpdateQuizAttemptDto } from './dto/update-quizattempt.dto';
import { QuizAttempt } from 'src/database/entities/quizattempt.entity';
import { PaginationService } from 'src/common/helpers/pagination.service';
import { PaginationOptionsDto } from 'src/common/dto/pagination-options.dto.ts';
import { BaseService } from '../base/base.service';

@Injectable()
export class QuizAttemptService extends BaseService<QuizAttempt> {
  constructor(
    @InjectRepository(QuizAttempt)
    quizAttemptRepository: Repository<QuizAttempt>,
    paginationService: PaginationService,
  ) {
    super(quizAttemptRepository, paginationService);
  }
}
