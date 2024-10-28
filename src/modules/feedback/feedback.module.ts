import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FeedbackService } from './feedback.service';
import { FeedbackController } from './feedback.controller';
import { Feedback } from 'src/database/entities/feedback.entity';
import { UnitModule } from '../unit/unit.module';
import { ExamModule } from '../exam/exam.module';
import { QuestionModule } from '../question/question.module';
import { AccountModule } from '../account/account.module';
import { LessonModule } from '../lesson/lesson.module';
import { FeedbacksGateway } from '../nofitication/feedback.gateway';

@Module({
    imports: [
        TypeOrmModule.forFeature([Feedback]),
        // ExamModule,
        AccountModule,
        forwardRef(() => LessonModule),
    ],
    providers: [FeedbackService, FeedbacksGateway],
    controllers: [FeedbackController],
    exports: [FeedbackService],
})
export class FeedbackModule {}
