import { Controller, Get, Post, Body, Param, Delete, Query, Put, HttpStatus } from '@nestjs/common';
import { CreateQuizAttemptDto } from './dto/create-quizattempt.dto';
import { UpdateQuizAttemptDto } from './dto/update-quizattempt.dto';
import { QuizAttemptService } from './quiz-attempt.service';
import { PaginationOptionsDto } from 'src/common/dto/pagination-options.dto.ts';
import { ResponseHelper } from 'src/common/helpers/response.helper';
import { QuizAttempt } from 'src/database/entities/quizattempt.entity';
import { BaseController } from '../base/base.controller';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('QuizAttempts')
@Controller('quiz-attempts')
export class QuizAttemptController extends BaseController<QuizAttempt> {
  constructor(quizAttemptService: QuizAttemptService) {
    super(quizAttemptService, 'QuizAttempt');
  }
}
