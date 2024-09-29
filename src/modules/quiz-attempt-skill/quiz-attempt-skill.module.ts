import { Module } from '@nestjs/common';
import { QuizAttemptSkillService } from './quiz-attempt-skill.service';
import { QuizAttemptSkillController } from './quiz-attempt-skill.controller';

@Module({
  providers: [QuizAttemptSkillService],
  controllers: [QuizAttemptSkillController]
})
export class QuizAttemptSkillModule {}
