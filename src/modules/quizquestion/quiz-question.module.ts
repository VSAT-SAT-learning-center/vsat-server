import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { QuizQuestion } from 'src/database/entities/quizquestion.entity';
import { QuizQuestionController } from './quiz-question.controller';
import { QuizQuestionService } from './quiz-question.service';
import { PaginationService } from 'src/common/helpers/pagination.service';

@Module({
    imports: [TypeOrmModule.forFeature([QuizQuestion])],
    controllers: [QuizQuestionController],
    providers: [QuizQuestionService, PaginationService],
})
export class QuizQuestionModule {}
