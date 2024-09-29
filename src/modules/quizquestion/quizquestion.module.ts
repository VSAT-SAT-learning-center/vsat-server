import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { QuizQuestion } from 'src/database/entities/quizquestion.entity';
import { QuizQuestionController } from './quizquestion.controller';
import { QuizQuestionService } from './quizquestion.service';

@Module({
    imports: [TypeOrmModule.forFeature([QuizQuestion])],
    controllers: [QuizQuestionController],
    providers: [QuizQuestionService],
})
export class QuizQuestionModule {}
