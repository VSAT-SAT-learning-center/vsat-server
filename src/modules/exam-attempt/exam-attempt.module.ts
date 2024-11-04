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
import { Section } from 'src/database/entities/section.entity';
import { Level } from 'src/database/entities/level.entity';
import { UnitProgressModule } from '../unit-progress/unit-progress.module';
import { Unit } from 'src/database/entities/unit.entity';
import { Domain } from 'src/database/entities/domain.entity';
import { ExamAttemptDetail } from 'src/database/entities/examattemptdetail.entity';

@Module({
    imports: [
        TypeOrmModule.forFeature([ExamAttempt, StudyProfile, Exam, Level, Section, Unit, Domain, ExamAttemptDetail]),
        TargetLearningModule,
        UnitProgressModule,
    ],
    providers: [ExamAttemptService],
    controllers: [ExamAttemptController],
    exports: [ExamAttemptService],
})
export class ExamAttemptModule {}
