import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PaginationService } from 'src/common/helpers/pagination.service';
import { Quiz } from 'src/database/entities/quiz.entity';
import { QuizAttempt } from 'src/database/entities/quizattempt.entity';
import { StudyProfile } from 'src/database/entities/studyprofile.entity';
import { QuizAttemptService } from './quiz-attempt.service';
import { QuizAttemptController } from './quiz-attempt.controller';
import { QuizModule } from '../quiz/quiz.module';
import { QuizAttemptAnswerModule } from '../quiz-attempt-answer/quiz-attempt-answer.module';
import { QuizQuestionModule } from '../quizquestion/quiz-question.module';
import { RecommendationModule } from '../recommendation-service/recommendation.module';
import { QuizQuestionItemModule } from '../quiz-question-item/quiz-question-item.module';

@Module({
    imports: [
        TypeOrmModule.forFeature([QuizAttempt]),
        QuizModule,
        QuizAttemptAnswerModule,
        QuizQuestionModule,
        RecommendationModule,
        QuizQuestionItemModule
    ],
    providers: [QuizAttemptService, PaginationService],
    controllers: [QuizAttemptController],
    exports: [QuizAttemptService],
})
export class QuizAttemptModule {}
