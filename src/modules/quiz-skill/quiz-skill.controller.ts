import { Controller, Get, Post, Body, Param, Delete, Query, Put, HttpStatus } from '@nestjs/common';
import { CreateQuizSkillDto } from './dto/create-quizskill.dto';
import { UpdateQuizSkillDto } from './dto/update-quizskill.dto';
import { QuizSkillService } from './quiz-skill.service';
import { PaginationOptionsDto } from 'src/common/dto/pagination-options.dto.ts';
import { ResponseHelper } from 'src/common/helpers/response.helper';
import { BaseController } from '../base/base.controller';
import { QuizSkill } from 'src/database/entities/quizskill.entity';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('QuizSkills')
@Controller('quiz-skills')
export class QuizSkillController extends BaseController<QuizSkill> {
  constructor(quizSkillService: QuizSkillService) {
    super(quizSkillService, 'QuizSkill'); // Pass service and entity name to BaseController
  }
}
