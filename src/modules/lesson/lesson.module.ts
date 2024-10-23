import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LessonService } from './lesson.service';
import { LessonController } from './lesson.controller';
import { Lesson } from 'src/database/entities/lesson.entity';
import { UnitAreaModule } from '../unit-area/unit-area.module';
import { LessonContentModule } from '../lesson-content/lesson-content.module';
import { FeedbackModule } from '../feedback/feedback.module';

@Module({
    imports: [
        TypeOrmModule.forFeature([Lesson]),
        UnitAreaModule,
        forwardRef(() => FeedbackModule),
        forwardRef(() => LessonContentModule),
    ],
    providers: [LessonService],
    controllers: [LessonController],
    exports: [LessonService],
})
export class LessonModule {}
