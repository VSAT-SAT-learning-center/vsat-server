import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PaginationService } from 'src/common/helpers/pagination.service';
import { ExamType } from 'src/database/entities/examtype.entity';
import { ExamTypeService } from './exam-type.service';
import { ExamTypeController } from './exam-type.controller';

@Module({
  imports: [TypeOrmModule.forFeature([ExamType])],
  providers: [ExamTypeService, PaginationService],
  controllers: [ExamTypeController],
})
export class ExamTypeModule {}
