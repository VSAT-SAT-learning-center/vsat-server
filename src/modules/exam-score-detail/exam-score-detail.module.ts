import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PaginationService } from 'src/common/helpers/pagination.service';
import { ExamScoreDetail } from 'src/database/entities/examscoredetail.entity';
import { Section } from 'src/database/entities/section.entity';
import { ExamScoreDetailService } from './exam-score-detail.service';
import { ExamScoreDetailController } from './exam-score-detail.controller';

@Module({
    imports: [TypeOrmModule.forFeature([ExamScoreDetail, Section])],
    providers: [ExamScoreDetailService],
    controllers: [ExamScoreDetailController],
    exports: [ExamScoreDetailService],
})
export class ExamScoreDetailModule {}
