import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PaginationService } from 'src/common/helpers/pagination.service';
import { Quiz } from 'src/database/entities/quiz.entity';
import { QuizSkill } from 'src/database/entities/quizskill.entity';
import { Skill } from 'src/database/entities/skill.entity';
import { QuizSkillService } from './quiz-skill.service';
import { QuizSkillController } from './quiz-skill.controller';

@Module({
  imports: [TypeOrmModule.forFeature([QuizSkill, Quiz, Skill])],
  providers: [QuizSkillService, PaginationService],
  controllers: [QuizSkillController],
})
export class QuizSkillModule {}
