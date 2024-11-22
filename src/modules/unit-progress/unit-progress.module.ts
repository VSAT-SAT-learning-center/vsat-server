import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UnitProgress } from 'src/database/entities/unitprogress.entity';
import { UnitProgressService } from './unit-progress.service';
import { UnitProgressController } from './unit-progress.controller';
import { UnitModule } from '../unit/unit.module';
import { UnitAreaModule } from '../unit-area/unit-area.module';
import { UnitAreaProgressModule } from '../unit-area-progress/unit-area-progress.module';
import { TargetLearningModule } from '../target-learning/target-learning.module';
import { TargetLearningDetailModule } from '../target-learning-detail/target-learning-detail.module';
import { Unit } from 'src/database/entities/unit.entity';
import { UnitArea } from 'src/database/entities/unitarea.entity';
import { UnitAreaProgress } from 'src/database/entities/unitareaprogress.entity';
import { LessonProgress } from 'src/database/entities/lessonprogress.entity';
import { TargetLearningDetail } from 'src/database/entities/targetlearningdetail.entity';
import { TargetLearning } from 'src/database/entities/targetlearning.entity';
import { ExamAttemptModule } from '../exam-attempt/exam-attempt.module';

@Module({
    imports: [
        TypeOrmModule.forFeature([
            UnitProgress,
            Unit,
            UnitArea,
            UnitAreaProgress,
            LessonProgress,
            TargetLearningDetail,
            TargetLearning,
        ]),
        forwardRef(() => TargetLearningModule),
        forwardRef(() => UnitAreaModule),
        forwardRef(() => UnitModule),
        forwardRef(() => UnitAreaProgressModule),
        forwardRef(() => UnitModule),
        forwardRef(() => ExamAttemptModule),
        TargetLearningDetailModule,
    ],
    providers: [UnitProgressService],
    controllers: [UnitProgressController],
    exports: [UnitProgressService],
})
export class UnitProgressModule {}
