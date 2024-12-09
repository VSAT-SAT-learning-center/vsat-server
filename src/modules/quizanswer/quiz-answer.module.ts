import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { QuizAnswer } from 'src/database/entities/quizanswer.entity';
import { QuizAnswerService } from './quiz-answer.service';
import { QuizQuestion } from 'src/database/entities/quizquestion.entity';

@Module({
    imports: [TypeOrmModule.forFeature([QuizAnswer, QuizQuestion])],
    providers: [QuizAnswerService],
    exports: [QuizAnswerService],
})
export class QuizAnswerModule {}
