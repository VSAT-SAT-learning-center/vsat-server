import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Exam } from 'src/database/entities/exam.entity';
import { ExamAttempt } from 'src/database/entities/examattempt.entity';
import { StudyProfile } from 'src/database/entities/studyprofile.entity';
import { ExamAttemptService } from './exam-attempt.service';
import { ExamAttemptController } from './exam-attempt.controller';
import { PaginationService } from 'src/common/helpers/pagination.service';
import { TargetLearningService } from '../target-learning/target-learning.service';
import { TargetLearningModule } from '../target-learning/target-learning.module';

@Module({
    imports: [
        TypeOrmModule.forFeature([ExamAttempt, StudyProfile, Exam]),
        TargetLearningModule,
    ],
    providers: [ExamAttemptService],
    controllers: [ExamAttemptController],
    exports: [ExamAttemptService],
})
export class ExamAttemptModule {}
