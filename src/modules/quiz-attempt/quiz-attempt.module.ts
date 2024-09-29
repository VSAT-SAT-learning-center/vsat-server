import { Module } from '@nestjs/common';
import { QuizAttemptService } from './quiz-attempt.service';
import { QuizAttemptController } from './quiz-attempt.controller';

@Module({
  providers: [QuizAttemptService],
  controllers: [QuizAttemptController]
})
export class QuizAttemptModule {}
