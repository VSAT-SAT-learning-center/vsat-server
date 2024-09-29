import { Module } from '@nestjs/common';
import { ExamStructureService } from './exam-structure.service';
import { ExamStructureController } from './exam-structure.controller';

@Module({
  providers: [ExamStructureService],
  controllers: [ExamStructureController]
})
export class ExamStructureModule {}
