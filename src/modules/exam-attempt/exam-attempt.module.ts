import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Exam } from 'src/database/entities/exam.entity';
import { ExamAttempt } from 'src/database/entities/examattempt.entity';
import { StudyProfile } from 'src/database/entities/studyprofile.entity';
import { ExamAttemptService } from './exam-attempt.service';
import { ExamAttemptController } from './exam-attempt.controller';
import { PaginationService } from 'src/common/helpers/pagination.service';

@Module({
  imports: [TypeOrmModule.forFeature([ExamAttempt, StudyProfile, Exam])],
  providers: [ExamAttemptService, PaginationService],
  controllers: [ExamAttemptController],
})
export class ExamAttemptModule {}
