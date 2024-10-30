import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PaginationService } from 'src/common/helpers/pagination.service';
import { ExamScore } from 'src/database/entities/examscore.entity';
import { ExamStructure } from 'src/database/entities/examstructure.entity';
import { ExamScoreService } from './exam-score.service';
import { ExamScoreController } from './exam-score.controller';
@Module({
  imports: [TypeOrmModule.forFeature([ExamScore, ExamStructure])],
  providers: [ExamScoreService, PaginationService],
  controllers: [ExamScoreController],
})
export class ExamScoreModule {}
