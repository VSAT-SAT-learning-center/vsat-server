import { Module } from '@nestjs/common';
import { ExamAttemptDetailService } from './exam-attempt-detail.service';
import { ExamAttemptDetailController } from './exam-attempt-detail.controller';

@Module({
  providers: [ExamAttemptDetailService],
  controllers: [ExamAttemptDetailController]
})
export class ExamAttemptDetailModule {}
