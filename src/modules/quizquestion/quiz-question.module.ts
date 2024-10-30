import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { QuizQuestion } from 'src/database/entities/quizquestion.entity';
import { QuizQuestionController } from './quiz-question.controller';
import { QuizQuestionService } from './quiz-question.service';
import { PaginationService } from 'src/common/helpers/pagination.service';
import { Level } from 'src/database/entities/level.entity';
import { Skill } from 'src/database/entities/skill.entity';
import { Section } from 'src/database/entities/section.entity';
import { QuizAnswerModule } from '../quizanswer/quiz-answer.module';

@Module({
    imports: [TypeOrmModule.forFeature([QuizQuestion, Level, Section, Skill]), QuizAnswerModule],
    controllers: [QuizQuestionController],
    providers: [QuizQuestionService, PaginationService],
})
export class QuizQuestionModule {}
