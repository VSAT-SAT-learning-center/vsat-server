import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PaginationService } from 'src/common/helpers/pagination.service';
import { ExamStructure } from 'src/database/entities/examstructure.entity';
import { ExamStructureController } from './exam-structure.controller';
import { ExamStructureService } from './exam-structure.service';
import { ExamStructureConfigService } from '../exam-structure-config/exam-structure-config.service';
import { ExamStructureConfigModule } from '../exam-structure-config/exam-structure-config.module';
import { ExamStructureType } from 'src/database/entities/examstructuretype.entity';
import { ExamScore } from 'src/database/entities/examscore.entity';

@Module({
    imports: [
        TypeOrmModule.forFeature([ExamStructure, ExamStructureType, ExamScore]),
        ExamStructureConfigModule,
    ],
    providers: [ExamStructureService, PaginationService],
    controllers: [ExamStructureController],
    exports: [ExamStructureService],
})
export class ExamStructureModule {}
