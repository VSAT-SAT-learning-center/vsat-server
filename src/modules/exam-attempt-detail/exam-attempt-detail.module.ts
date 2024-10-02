import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ExamAttempt } from 'src/database/entities/examattempt.entity';
import { ExamAttemptDetail } from 'src/database/entities/examattemptdetail.entity';
import { Question } from 'src/database/entities/question.entity';
import { ExamAttemptDetailController } from './exam-attempt-detail.controller';
import { ExamAttemptDetailService } from './exam-attempt-detail.service';

@Module({
  imports: [TypeOrmModule.forFeature([ExamAttemptDetail, ExamAttempt, Question])],
  providers: [ExamAttemptDetailService],
  controllers: [ExamAttemptDetailController],
})
export class ExamAttemptDetailModule {}
