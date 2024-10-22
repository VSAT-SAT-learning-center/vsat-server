import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FeedbackService } from './feedback.service';
import { FeedbackController } from './feedback.controller';
import { Feedback } from 'src/database/entities/feedback.entity';
import { PaginationService } from 'src/common/helpers/pagination.service';
import { UnitModule } from '../unit/unit.module';
import { ExamModule } from '../exam/exam.module';
import { QuestionModule } from '../question/question.module';
import { AccountModule } from '../account/account.module';
import { UnitAreaModule } from '../unit-area/unit-area.module';
import { LessonModule } from '../lesson/lesson.module';

@Module({
    imports: [
        TypeOrmModule.forFeature([Feedback]),
        UnitModule,
        UnitAreaModule,
        LessonModule,
        // ExamModule,
        // QuestionModule,
        // AccountModule,
    ],
    providers: [FeedbackService],
    controllers: [FeedbackController],
    exports: [FeedbackService],
})
export class FeedbackModule {}
