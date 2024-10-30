import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { QuizAnswer } from 'src/database/entities/quizanswer.entity';
import { QuizAnswerController } from './quiz-answer.controller';
import { QuizAnswerService } from './quiz-answer.service';

@Module({
    imports: [TypeOrmModule.forFeature([QuizAnswer])],
    controllers: [QuizAnswerController],
    providers: [QuizAnswerService],
})
export class QuizAnswerModule {}
