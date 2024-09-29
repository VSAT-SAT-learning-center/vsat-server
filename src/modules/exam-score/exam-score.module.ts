import { Module } from '@nestjs/common';
import { ExamScoreService } from './exam-score.service';
import { ExamScoreController } from './exam-score.controller';

@Module({
  providers: [ExamScoreService],
  controllers: [ExamScoreController]
})
export class ExamScoreModule {}
