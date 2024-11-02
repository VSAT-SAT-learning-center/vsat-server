import { Module } from '@nestjs/common';
import { ExamSemesterService } from './exam-semester.service';
import { ExamSemesterController } from './exam-semester.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ExamSemester } from 'src/database/entities/examsemeseter.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ExamSemester])], 
  providers: [ExamSemesterService],
  controllers: [ExamSemesterController]
})
export class ExamSemesterModule {}
