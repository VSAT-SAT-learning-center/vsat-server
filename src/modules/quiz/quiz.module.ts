import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { QuizService } from './quiz.service';
import { QuizController } from './quiz.controller';
import { Quiz } from 'src/database/entities/quiz.entity';
import { Unit } from 'src/database/entities/unit.entity';
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
    controllers: [QuizController],
    exports: [QuizService],
})
export class QuizModule {}
