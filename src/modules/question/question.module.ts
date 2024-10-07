import { Module } from '@nestjs/common';
import { QuestionService } from './question.service';
import { QuestionController } from './question.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Question } from 'src/database/entities/question.entity';
import { Level } from 'src/database/entities/level.entity';
import { Unit } from 'src/database/entities/unit.entity';
import { Skill } from 'src/database/entities/skill.entity';
import { Lesson } from 'src/database/entities/lesson.entity';
import { Answerservice } from '../answer/answer.service';
import { Answer } from 'src/database/entities/anwser.entity';

@Module({
    imports: [TypeOrmModule.forFeature([Question, Level, Unit, Skill, Lesson, Answer])],
    providers: [QuestionService, Answerservice],
    controllers: [QuestionController],
})
export class QuestionModule {}
