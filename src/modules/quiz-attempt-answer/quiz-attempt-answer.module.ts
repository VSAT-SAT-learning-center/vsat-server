import { Module } from '@nestjs/common';
import { QuizAttemptAnswerService } from './quiz-attempt-answer.service';
import { QuizAttemptAnswerController } from './quiz-attempt-answer.controller';

@Module({
  providers: [QuizAttemptAnswerService],
  controllers: [QuizAttemptAnswerController]
})
export class QuizAttemptAnswerModule {}
