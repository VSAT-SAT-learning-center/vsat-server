import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ExamQuestion } from 'src/database/entities/examquestion.entity';
import { ExamQuestionService } from './examquestion.service';
import { ExamQuestionController } from './examquestion.controller';
import { Question } from 'src/database/entities/question.entity';
import { Answer } from 'src/database/entities/anwser.entity';
import { Exam } from 'src/database/entities/exam.entity';
import { QuestionService } from '../question/question.service';
import { ExamService } from '../exam/exam.service';
import { Unit } from 'src/database/entities/unit.entity';
import { Skill } from 'src/database/entities/skill.entity';
import { Lesson } from 'src/database/entities/lesson.entity';
import { Level } from 'src/database/entities/level.entity';
import { Answerservice } from '../answer/answer.service';
import { ModuleType } from 'src/database/entities/moduletype.entity';
import { ExamStructure } from 'src/database/entities/examstructure.entity';
import { ExamType } from 'src/database/entities/examtype.entity';
import { Section } from 'src/database/entities/section.entity';

@Module({
    imports: [
        TypeOrmModule.forFeature([
            ExamQuestion,
            Question,
            Answer,
            Exam,
            Skill,
            Section,
            Level,
            ModuleType,
            ExamStructure,
            ExamType,
        ]),
    ],
    controllers: [ExamQuestionController],
    providers: [
        ExamQuestionService,
        QuestionService,
        Answerservice,
        ExamService,
    ],
})
export class ExamQuestionModule {}
