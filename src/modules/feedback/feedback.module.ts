import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FeedbackService } from './feedback.service';
import { FeedbackController } from './feedback.controller';
import { Feedback } from 'src/database/entities/feedback.entity';
import { PaginationService } from 'src/common/helpers/pagination.service';
import { UnitModule } from '../unit/unit.module';
import { ExamModule } from '../exam/exam.module';
import { QuestionModule } from '../question/question.module';
import { AccountModule } from '../account/account.module';

@Module({
  imports: [TypeOrmModule.forFeature([Feedback]), UnitModule, ExamModule, QuestionModule, AccountModule],
  providers: [FeedbackService, PaginationService],
  controllers: [FeedbackController],
  exports: [FeedbackService]
})
export class FeedbackModule {}
