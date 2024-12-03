import { Controller } from '@nestjs/common';
import { QuizAttemptSkillService } from './quiz-attempt-skill.service';
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