import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { QuizAttempt } from 'src/database/entities/quizattempt.entity';
import { QuizAttemptSkill } from 'src/database/entities/quizattemptskill.entity';
import { Skill } from 'src/database/entities/skill.entity';
import { QuizAttemptSkillService } from './quiz-attempt-skill.service';
import { QuizAttemptSkillController } from './quiz-attempt-skill.controller';
import { Account } from 'src/database/entities/account.entity';

@Module({
  imports: [TypeOrmModule.forFeature([QuizAttemptSkill, QuizAttempt, Skill, Account])],
  providers: [QuizAttemptSkillService],
  controllers: [QuizAttemptSkillController],
})
export class QuizAttemptSkillModule {}
