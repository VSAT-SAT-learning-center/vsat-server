import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PaginationService } from 'src/common/helpers/pagination.service';
import { ExamScore } from 'src/database/entities/examscore.entity';
import { ExamScoreService } from './exam-score.service';
import { ExamScoreController } from './exam-score.controller';
import { ExamScoreDetailModule } from '../exam-score-detail/exam-score-detail.module';
import { ExamStructure } from 'src/database/entities/examstructure.entity';
import { ExamStructureType } from 'src/database/entities/examstructuretype.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ExamScore, ExamStructure, ExamStructureType]), ExamScoreDetailModule], 
  providers: [ExamScoreService, PaginationService],
  controllers: [ExamScoreController],
})
export class ExamScoreModule {}
