import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PaginationService } from 'src/common/helpers/pagination.service';
import { Quiz } from 'src/database/entities/quiz.entity';
import { Skill } from 'src/database/entities/skill.entity';
import { QuizConfigService } from './quiz-config.service';
import { QuizConfigController } from './quiz-config.controller';
import { QuizConfig } from 'src/database/entities/quizconfig.entity';

@Module({
  imports: [TypeOrmModule.forFeature([QuizConfig, Quiz, Skill])],
  providers: [QuizConfigService, PaginationService],
  controllers: [QuizConfigController],
  exports: [QuizConfigService],
})
export class QuizConfigModule {}
