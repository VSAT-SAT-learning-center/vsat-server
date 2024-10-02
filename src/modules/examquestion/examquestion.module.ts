import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ExamQuestion } from 'src/database/entities/examquestion.entity';
import { ExamQuestionService } from './examquestion.service';
import { ExamQuestionController } from './examquestion.controller';
import { PaginationService } from 'src/common/helpers/pagination.service';

@Module({
    imports: [TypeOrmModule.forFeature([ExamQuestion])],
    controllers: [ExamQuestionController],
    providers: [ExamQuestionService, PaginationService],
})
export class ExamQuestionModule {}
