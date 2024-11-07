import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PaginationService } from 'src/common/helpers/pagination.service';
import { QuizAttempt } from 'src/database/entities/quizattempt.entity';
import { QuizAttemptAnswer } from 'src/database/entities/quizattemptanswer.entity';
import { QuizQuestion } from 'src/database/entities/quizquestion.entity';
import { QuizAttemptAnswerService } from './quiz-attempt-answer.service';
import { QuizAttemptAnswerController } from './quiz-attempt-answer.controller';

@Module({
  imports: [TypeOrmModule.forFeature([QuizAttemptAnswer, QuizAttempt, QuizQuestion])],
  providers: [QuizAttemptAnswerService, PaginationService],
  controllers: [QuizAttemptAnswerController],
  exports: [QuizAttemptAnswerService],
})
export class QuizAttemptAnswerModule {}
