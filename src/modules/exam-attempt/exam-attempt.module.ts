import { Module } from '@nestjs/common';
import { ExamAttemptService } from './exam-attempt.service';
import { ExamAttemptController } from './exam-attempt.controller';

@Module({
  providers: [ExamAttemptService],
  controllers: [ExamAttemptController]
})
export class ExamAttemptModule {}
