import { forwardRef, Module } from '@nestjs/common';
import { QuestionService } from './question.service';
import { QuestionController } from './question.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Question } from 'src/database/entities/question.entity';
import { Level } from 'src/database/entities/level.entity';
import { Skill } from 'src/database/entities/skill.entity';
import { Answerservice } from '../answer/answer.service';
import { Answer } from 'src/database/entities/anwser.entity';
import { Section } from 'src/database/entities/section.entity';
import { FeedbackModule } from '../feedback/feedback.module';
import { Account } from 'src/database/entities/account.entity';
import { QuizQuestion } from 'src/database/entities/quizquestion.entity';
import { Exam } from 'src/database/entities/exam.entity';
import { Unit } from 'src/database/entities/unit.entity';
import { StudyProfile } from 'src/database/entities/studyprofile.entity';
import { Domain } from 'src/database/entities/domain.entity';

@Module({
    imports: [
        TypeOrmModule.forFeature([Question, Section, Level, Skill, Answer, Account, QuizQuestion, Exam, Unit, StudyProfile, Domain]),

        forwardRef(() => FeedbackModule),
    ],
    providers: [QuestionService, Answerservice],
    controllers: [QuestionController],
    exports: [QuestionService],
})
export class QuestionModule {}
