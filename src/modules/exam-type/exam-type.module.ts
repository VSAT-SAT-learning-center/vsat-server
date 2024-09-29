import { Module } from '@nestjs/common';
import { ExamTypeService } from './exam-type.service';
import { ExamTypeController } from './exam-type.controller';

@Module({
  providers: [ExamTypeService],
  controllers: [ExamTypeController]
})
export class ExamTypeModule {}
