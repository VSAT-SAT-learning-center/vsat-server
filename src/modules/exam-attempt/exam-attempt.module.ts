import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Exam } from 'src/database/entities/exam.entity';
import { ExamAttempt } from 'src/database/entities/examattempt.entity';
import { StudyProfile } from 'src/database/entities/studyprofile.entity';
import { ExamAttemptService } from './exam-attempt.service';
import { ExamAttemptController } from './exam-attempt.controller';

@Module({
  imports: [TypeOrmModule.forFeature([ExamAttempt, StudyProfile, Exam])],
  providers: [ExamAttemptService],
  controllers: [ExamAttemptController],
})
export class ExamAttemptModule {}
