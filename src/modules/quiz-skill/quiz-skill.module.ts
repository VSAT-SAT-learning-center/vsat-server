import { Module } from '@nestjs/common';
import { QuizSkillService } from './quiz-skill.service';
import { QuizSkillController } from './quiz-skill.controller';

@Module({
  providers: [QuizSkillService],
  controllers: [QuizSkillController]
})
export class QuizSkillModule {}
