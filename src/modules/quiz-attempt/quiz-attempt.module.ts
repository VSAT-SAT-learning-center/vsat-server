import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PaginationService } from 'src/common/helpers/pagination.service';
import { Quiz } from 'src/database/entities/quiz.entity';
import { QuizAttempt } from 'src/database/entities/quizattempt.entity';
import { StudyProfile } from 'src/database/entities/studyprofile.entity';
import { QuizAttemptService } from './quiz-attempt.service';
import { QuizAttemptController } from './quiz-attempt.controller';

@Module({
  imports: [TypeOrmModule.forFeature([QuizAttempt, StudyProfile, Quiz])],
  providers: [QuizAttemptService, PaginationService],
  controllers: [QuizAttemptController],
})
export class QuizAttemptModule {}
