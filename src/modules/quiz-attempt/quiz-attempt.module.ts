import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PaginationService } from 'src/common/helpers/pagination.service';
import { QuizAttempt } from 'src/database/entities/quizattempt.entity';
import { QuizAttemptService } from './quiz-attempt.service';
import { QuizAttemptController } from './quiz-attempt.controller';
import { QuizModule } from '../quiz/quiz.module';
import { QuizQuestionModule } from '../quizquestion/quiz-question.module';
import { RecommendationModule } from '../recommendation-service/recommendation.module';
import { QuizQuestionItemModule } from '../quiz-question-item/quiz-question-item.module';
import { QuizAttemptAnswerModule } from '../quiz-attempt-answer/quiz-attempt-answer.module';

@Module({
    imports: [
        TypeOrmModule.forFeature([QuizAttempt]),
        QuizModule,
        QuizAttemptAnswerModule,
        QuizQuestionModule,
        RecommendationModule,
        QuizQuestionItemModule,
        RecommendationModule
    ],
    providers: [QuizAttemptService],
    controllers: [QuizAttemptController],
    exports: [QuizAttemptService],
})
export class QuizAttemptModule {}
