import { Module } from '@nestjs/common';
import { ExamScoreDetailService } from './exam-score-detail.service';
import { ExamScoreDetailController } from './exam-score-detail.controller';

@Module({
  providers: [ExamScoreDetailService],
  controllers: [ExamScoreDetailController]
})
export class ExamScoreDetailModule {}
