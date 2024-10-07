import { Module } from '@nestjs/common';
import { Answerservice } from './answer.service';
import { AnswerController } from './answer.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Answer } from 'src/database/entities/anwser.entity';
import { Question } from 'src/database/entities/question.entity';

@Module({
    imports: [TypeOrmModule.forFeature([Answer, Question])],
    providers: [Answerservice],
    controllers: [AnswerController],
})
export class AnswerModule {}
