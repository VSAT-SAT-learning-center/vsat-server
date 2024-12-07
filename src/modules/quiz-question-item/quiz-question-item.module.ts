import { forwardRef, Module } from '@nestjs/common';
import { QuizQuestionItemService } from './quiz-question-item.service';
import { QuizQuestionItem } from 'src/database/entities/quizquestionitem.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { QuizModule } from '../quiz/quiz.module';

@Module({
    imports: [
        TypeOrmModule.forFeature([QuizQuestionItem]),
        forwardRef(() => QuizModule),
    ],
    providers: [QuizQuestionItemService],
    exports: [QuizQuestionItemService],
})
export class QuizQuestionItemModule {}
