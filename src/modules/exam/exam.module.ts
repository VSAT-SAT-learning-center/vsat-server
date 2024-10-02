import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ExamService } from './exam.service';
import { ExamController } from './exam.controller';
import { Exam } from 'src/database/entities/exam.entity';
import { ExamStructure } from 'src/database/entities/examstructure.entity';
import { ExamType } from 'src/database/entities/examtype.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Exam, ExamStructure, ExamType])],
  providers: [ExamService],
  controllers: [ExamController],
})
export class ExamModule {}
