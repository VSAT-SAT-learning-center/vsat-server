import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TargetLearning } from 'src/database/entities/targetlearning.entity';
import { TargetLearningService } from './target-learning.service';
import { TargetLearningController } from './target-learning.controller';
import { ExamAttempt } from 'src/database/entities/examattempt.entity';
import { ExamAttemptModule } from '../exam-attempt/exam-attempt.module';
import { StudyProfile } from 'src/database/entities/studyprofile.entity';
import { TargetLearningDetailModule } from '../target-learning-detail/target-learning-detail.module';
import { UnitModule } from '../unit/unit.module';
import { LessonProgressModule } from '../lesson-progress/lesson-progress.module';

@Module({
    imports: [
        TypeOrmModule.forFeature([TargetLearning, ExamAttempt, StudyProfile]),
        forwardRef(() => ExamAttemptModule),
        TargetLearningDetailModule,
        LessonProgressModule,
        forwardRef(() => UnitModule),
    ],
    providers: [TargetLearningService],
    controllers: [TargetLearningController],
    exports: [TargetLearningService],
})
export class TargetLearningModule {}
