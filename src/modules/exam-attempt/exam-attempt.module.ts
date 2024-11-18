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
import { Account } from 'src/database/entities/account.entity';
import { ExamAttemptDetailModule } from '../exam-attempt-detail/exam-attempt-detail.module';
import { ExamStructure } from 'src/database/entities/examstructure.entity';
import { ExamScore } from 'src/database/entities/examscore.entity';
import { ExamScoreDetail } from 'src/database/entities/examscoredetail.entity';
import { DomainDistribution } from 'src/database/entities/domaindistribution.entity';
import { ModuleType } from 'src/database/entities/moduletype.entity';
import { StudyProfileService } from '../study-profile/study-profile.service';
import { TargetLearningDetailModule } from '../target-learning-detail/target-learning-detail.module';
import { TargetLearning } from 'src/database/entities/targetlearning.entity';

@Module({
    imports: [
        TypeOrmModule.forFeature([
            ExamAttempt,
            StudyProfile,
            Exam,
            Level,
            Section,
            Unit,
            Domain,
            ExamAttemptDetail,
            Account,
            ExamStructure,
            ExamScore,
            ExamScoreDetail,
            DomainDistribution,
            ModuleType,
            TargetLearning,
        ]),
        TargetLearningDetailModule,
        TargetLearningModule,
        UnitProgressModule,
        ExamAttemptDetailModule,
    ],
    providers: [ExamAttemptService, StudyProfileService, TargetLearningService],
    controllers: [ExamAttemptController],
    exports: [ExamAttemptService],
})
export class ExamAttemptModule {}
