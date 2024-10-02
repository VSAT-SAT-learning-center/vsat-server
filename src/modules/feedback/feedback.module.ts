import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FeedbackService } from './feedback.service';
import { FeedbackController } from './feedback.controller';
import { Feedback } from 'src/database/entities/feedback.entity';
import { Unit } from 'src/database/entities/unit.entity';
import { Exam } from 'src/database/entities/exam.entity';
import { Question } from 'src/database/entities/question.entity';
import { Account } from 'src/database/entities/account.entity';
import { PaginationService } from 'src/common/helpers/pagination.service';

@Module({
  imports: [TypeOrmModule.forFeature([Feedback, Unit, Exam, Question, Account])],
  providers: [FeedbackService, PaginationService],
  controllers: [FeedbackController],
})
export class FeedbackModule {}
