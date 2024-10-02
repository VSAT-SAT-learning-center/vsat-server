import { Controller, Get, Post, Body, Param, Delete, Query, Put, HttpStatus } from '@nestjs/common';
import { CreateQuizAttemptSkillDto } from './dto/create-quizattemptskill.dto';
import { UpdateQuizAttemptSkillDto } from './dto/update-quizattemptskill.dto';
import { QuizAttemptSkillService } from './quiz-attempt-skill.service';
import { PaginationOptionsDto } from 'src/common/dto/pagination-options.dto.ts';
import { ResponseHelper } from 'src/common/helpers/response.helper';
import { ApiTags } from '@nestjs/swagger';
import { BaseController } from '../base/base.controller';
import { QuizAttemptSkill } from 'src/database/entities/quizattemptskill.entity';

@ApiTags('QuizAttemptSkills')
@Controller('quiz-attempt-skills')
export class QuizAttemptSkillController extends BaseController<QuizAttemptSkill> {
  constructor(quizAttemptSkillService: QuizAttemptSkillService) {
    super(quizAttemptSkillService, 'QuizAttemptSkill'); // Pass service and entity name to BaseController
  }
}