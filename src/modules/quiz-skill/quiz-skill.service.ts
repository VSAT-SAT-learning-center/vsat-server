import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateQuizSkillDto } from './dto/create-quizskill.dto';
import { UpdateQuizSkillDto } from './dto/update-quizskill.dto';
import { QuizSkill } from 'src/database/entities/quizskill.entity';
import { PaginationService } from 'src/common/helpers/pagination.service';
import { PaginationOptionsDto } from 'src/common/dto/pagination-options.dto.ts';
import { BaseService } from '../base/base.service';


@Injectable()
export class QuizSkillService extends BaseService<QuizSkill> {
  constructor(
    @InjectRepository(QuizSkill) repository: Repository<QuizSkill>, // Inject repository for QuizSkill
    paginationService: PaginationService,
  ) {
    super(repository, paginationService); // Pass repository and paginationService to BaseService
  }
}
