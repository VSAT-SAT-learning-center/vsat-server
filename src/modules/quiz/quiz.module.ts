import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { QuizService } from './quiz.service';
import { Quiz } from 'src/database/entities/quiz.entity';
import { QuizConfigModule } from '../quiz-config/quiz-config.module';
import { UnitModule } from '../unit/unit.module';
import { QuizQuestionModule } from '../quizquestion/quiz-question.module';
import { QuizQuestionItemModule } from '../quiz-question-item/quiz-question-item.module';

@Module({
    imports: [
        TypeOrmModule.forFeature([Quiz]),
        UnitModule,
        QuizConfigModule,
        QuizQuestionModule,
        QuizQuestionItemModule,
    ],
    providers: [QuizService],
    exports: [QuizService],
})
export class QuizModule {}
