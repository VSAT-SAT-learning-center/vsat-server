import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ExamService } from './exam.service';
import { ExamController } from './exam.controller';
import { Exam } from 'src/database/entities/exam.entity';
import { ExamStructure } from 'src/database/entities/examstructure.entity';
import { ExamType } from 'src/database/entities/examtype.entity';
import { PaginationService } from 'src/common/helpers/pagination.service';
import { ExamQuestionModule } from '../examquestion/examquestion.module';
import { ModuleTypeModule } from '../module-type/module-type.module';
import { ModuleType } from 'src/database/entities/moduletype.entity';
import { Domain } from 'src/database/entities/domain.entity';
import { Question } from 'src/database/entities/question.entity';

@Module({
    imports: [
        TypeOrmModule.forFeature([Exam, ExamStructure, ExamType, ModuleType, Domain, Question]),
        ExamQuestionModule,
        ModuleTypeModule,
    ],
    providers: [ExamService],
    controllers: [ExamController],
    exports: [ExamService],
})
export class ExamModule {}
