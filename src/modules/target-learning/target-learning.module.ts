import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TargetLearning } from 'src/database/entities/targetlearning.entity';
import { TargetLearningService } from './target-learning.service';
import { TargetLearningController } from './target-learning.controller';
import { ExamAttempt } from 'src/database/entities/examattempt.entity';
import { ExamAttemptModule } from '../exam-attempt/exam-attempt.module';
import { StudyProfile } from 'src/database/entities/studyprofile.entity';

@Module({
    imports: [
        TypeOrmModule.forFeature([TargetLearning, ExamAttempt, StudyProfile]),
        forwardRef(() => ExamAttemptModule),
    ],
    providers: [TargetLearningService],
    controllers: [TargetLearningController],
    exports: [TargetLearningService],
})
export class TargetLearningModule {}
