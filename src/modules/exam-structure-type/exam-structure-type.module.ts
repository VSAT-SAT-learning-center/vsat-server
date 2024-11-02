import { Module } from '@nestjs/common';

import { TypeOrmModule } from '@nestjs/typeorm';
import { ExamStructureType } from 'src/database/entities/examstructuretype.entity';
import { ExamStructureTypeController } from './exam-structure-type.controller';
import { ExamStructureTypeService } from './exam-structure-type.service';

@Module({
    imports: [TypeOrmModule.forFeature([ExamStructureType])],
    controllers: [ExamStructureTypeController],
    providers: [ExamStructureTypeService],
    exports: [ExamStructureTypeService],
})
export class ExamStructureTypeModule {}
