import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateQuizAttemptSkillDto } from './dto/create-quizattemptskill.dto';
import { UpdateQuizAttemptSkillDto } from './dto/update-quizattemptskill.dto';
import { QuizAttemptSkill } from 'src/database/entities/quizattemptskill.entity';
import { PaginationService } from 'src/common/helpers/pagination.service';
import { PaginationOptionsDto } from 'src/common/dto/pagination-options.dto.ts';
import { BaseService } from '../base/base.service';

@Injectable()
export class QuizAttemptSkillService extends BaseService<QuizAttemptSkill> {
  constructor(
    @InjectRepository(QuizAttemptSkill) repository: Repository<QuizAttemptSkill>, // Inject repository for QuizAttemptSkill
    paginationService: PaginationService,
  ) {
    super(repository, paginationService); // Pass repository and paginationService to BaseService
  }
}
