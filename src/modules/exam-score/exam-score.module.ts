import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ExamScore } from 'src/database/entities/examscore.entity';
import { ExamScoreService } from './exam-score.service';
import { ExamScoreController } from './exam-score.controller';
import { ExamScoreDetailModule } from '../exam-score-detail/exam-score-detail.module';
import { ExamStructure } from 'src/database/entities/examstructure.entity';
import { ExamStructureType } from 'src/database/entities/examstructuretype.entity';
import { ExamAttemptModule } from '../exam-attempt/exam-attempt.module';
import { ExamAttemptDetailModule } from '../exam-attempt-detail/exam-attempt-detail.module';
import { ModuleTypeModule } from '../module-type/module-type.module';

@Module({
    imports: [
        TypeOrmModule.forFeature([ExamScore, ExamStructure, ExamStructureType]),
        ExamScoreDetailModule,
        ExamAttemptModule,
        ExamAttemptDetailModule,
        ModuleTypeModule,
    ],
    providers: [ExamScoreService],
    controllers: [ExamScoreController],
    exports: [ExamScoreService],
})
export class ExamScoreModule {}
