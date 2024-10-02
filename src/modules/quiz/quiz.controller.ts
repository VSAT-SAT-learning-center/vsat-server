import { Controller, Get, Post, Body, Param, Delete, Query, Put, HttpStatus } from '@nestjs/common';
import { QuizService } from './quiz.service';
import { PaginationOptionsDto } from 'src/common/dto/pagination-options.dto.ts';
import { ResponseHelper } from 'src/common/helpers/response.helper';
import { UpdateQuizDto } from './dto/update-quiz.dto';
import { CreateQuizDto } from './dto/create-quiz.dto';
import { BaseController } from '../base/base.controller';
import { Quiz } from 'src/database/entities/quiz.entity';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Quizzes')
@Controller('quizzes')
export class QuizController extends BaseController<Quiz> {
  constructor(quizService: QuizService) {
    super(quizService, 'Quiz');
  }
}
