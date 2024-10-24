import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FeedbackService } from './feedback.service';
import { FeedbackController } from './feedback.controller';
import { Feedback } from 'src/database/entities/feedback.entity';
import { UnitModule } from '../unit/unit.module';
import { ExamModule } from '../exam/exam.module';
import { QuestionModule } from '../question/question.module';
import { AccountModule } from '../account/account.module';
import { UnitAreaModule } from '../unit-area/unit-area.module';
import { LessonModule } from '../lesson/lesson.module';
import { NotificationsGateway } from '../nofitication/nofitication.gateway';

@Module({
    imports: [
        TypeOrmModule.forFeature([Feedback]),
        // ExamModule,
        // QuestionModule,
        AccountModule,
        forwardRef(() => LessonModule),
        forwardRef(() => UnitModule),
    ],
    providers: [FeedbackService, NotificationsGateway],
    controllers: [FeedbackController],
    exports: [FeedbackService],
})
export class FeedbackModule {}
