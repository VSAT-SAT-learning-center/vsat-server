import { Controller, Get, Post, Body, Param, Delete, Query, Put, HttpStatus } from '@nestjs/common';
import { CreateQuizAttemptAnswerDto } from './dto/create-quizattemptanswer.dto';
import { UpdateQuizAttemptAnswerDto } from './dto/update-quizattemptanswer.dto';
import { QuizAttemptAnswerService } from './quiz-attempt-answer.service';
import { PaginationOptionsDto } from 'src/common/dto/pagination-options.dto.ts';
import { ResponseHelper } from 'src/common/helpers/response.helper';
import { ApiTags } from '@nestjs/swagger';
import { BaseController } from '../base/base.controller';
import { QuizAttemptAnswer } from 'src/database/entities/quizattemptanswer.entity';

@ApiTags('QuizAttemptAnswers')
@Controller('quiz-attempt-answers')
export class QuizAttemptAnswerController extends BaseController<QuizAttemptAnswer> {
  constructor(quizAttemptAnswerService: QuizAttemptAnswerService) {
    super(quizAttemptAnswerService, 'QuizAttemptAnswer'); // Pass service and entity name to BaseController
  }
}
