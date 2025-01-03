import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { QuizQuestion } from 'src/database/entities/quizquestion.entity';
import { QuizQuestionController } from './quiz-question.controller';
import { QuizQuestionService } from './quiz-question.service';
import { PaginationService } from 'src/common/helpers/pagination.service';
import { Level } from 'src/database/entities/level.entity';
import { Skill } from 'src/database/entities/skill.entity';
import { Section } from 'src/database/entities/section.entity';
import { QuizAnswerModule } from '../quizanswer/quiz-answer.module';
import { QuizAnswer } from 'src/database/entities/quizanswer.entity';
import { Feedback } from 'src/database/entities/feedback.entity';
import { FeedbackModule } from '../feedback/feedback.module';
import { Account } from 'src/database/entities/account.entity';

@Module({
    imports: [
        TypeOrmModule.forFeature([
            QuizQuestion,
            Level,
            Section,
            Skill,
            QuizAnswer,
            Account,
        ]),
        QuizAnswerModule,
        forwardRef(() => FeedbackModule),
    ],
    controllers: [QuizQuestionController],
    providers: [QuizQuestionService],
    exports: [QuizQuestionService],
})
export class QuizQuestionModule {}
