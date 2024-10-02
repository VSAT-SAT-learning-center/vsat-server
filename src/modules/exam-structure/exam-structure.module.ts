import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PaginationService } from 'src/common/helpers/pagination.service';
import { ExamStructure } from 'src/database/entities/examstructure.entity';
import { ExamStructureController } from './exam-structure.controller';
import { ExamStructureService } from './exam-structure.service';

@Module({
  imports: [TypeOrmModule.forFeature([ExamStructure])],
  providers: [ExamStructureService, PaginationService],
  controllers: [ExamStructureController],
})
export class ExamStructureModule {}
