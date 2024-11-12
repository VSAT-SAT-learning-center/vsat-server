import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ExamService } from './exam.service';
import { ExamController } from './exam.controller';
import { Exam } from 'src/database/entities/exam.entity';
import { ExamStructure } from 'src/database/entities/examstructure.entity';
import { ExamType } from 'src/database/entities/examtype.entity';
import { ExamQuestionModule } from '../examquestion/examquestion.module';
import { ModuleTypeModule } from '../module-type/module-type.module';
import { ModuleType } from 'src/database/entities/moduletype.entity';
import { Domain } from 'src/database/entities/domain.entity';
import { Question } from 'src/database/entities/question.entity';
import { FeedbackModule } from '../feedback/feedback.module';
import { DomainDistribution } from 'src/database/entities/domaindistribution.entity';
import { ExamStructureType } from 'src/database/entities/examstructuretype.entity';

@Module({
    imports: [
        TypeOrmModule.forFeature([
            Exam,
            ExamStructure,
            ExamType,
            ModuleType,
            Domain,
            Question,
            DomainDistribution,
            ExamStructureType,
        ]),
        ExamQuestionModule,
        ModuleTypeModule,
        FeedbackModule,
    ],
    providers: [ExamService],
    controllers: [ExamController],
    exports: [ExamService],
})
export class ExamModule {}
