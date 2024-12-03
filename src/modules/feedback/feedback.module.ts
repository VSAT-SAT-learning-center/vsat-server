import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FeedbackService } from './feedback.service';
import { FeedbackController } from './feedback.controller';
import { Feedback } from 'src/database/entities/feedback.entity';
import { AccountModule } from '../account/account.module';
import { LessonModule } from '../lesson/lesson.module';
import { FeedbacksGateway } from '../socket/feedback.gateway';
import { ModuleTypeModule } from '../module-type/module-type.module';
import { JwtService } from '@nestjs/jwt';
import { NotificationModule } from 'src/modules/notification/notification.module';
import { QuestionModule } from '../question/question.module';
import { QuizQuestionModule } from '../quizquestion/quiz-question.module';
import { UnitModule } from '../unit/unit.module';
import { ExamModule } from '../exam/exam.module';

@Module({
    imports: [
        TypeOrmModule.forFeature([Feedback]),
        AccountModule,
        ModuleTypeModule,
        NotificationModule,
        forwardRef(() => QuestionModule),
        forwardRef(() => QuizQuestionModule),
        forwardRef(() => UnitModule),
        forwardRef(() => LessonModule),
        forwardRef(() => ExamModule),
    ],
    providers: [FeedbackService, FeedbacksGateway, JwtService],
    controllers: [FeedbackController],
    exports: [FeedbackService],
})
export class FeedbackModule {}
