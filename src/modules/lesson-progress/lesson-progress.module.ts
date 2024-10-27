import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Lesson } from 'src/database/entities/lesson.entity';
import { LessonProgress } from 'src/database/entities/lessonprogress.entity';
import { UnitAreaProgress } from 'src/database/entities/unitareaprogress.entity';
import { LessonProgressService } from './lesson-progress.service';
import { LessonProgressController } from './lesson-progress.controller';
import { UnitAreaProgressModule } from '../unit-area-progress/unit-area-progress.module';
import { LessonModule } from '../lesson/lesson.module';

@Module({
    imports: [
        TypeOrmModule.forFeature([LessonProgress]),
        forwardRef(() => LessonModule),
        forwardRef(() => UnitAreaProgressModule),
    ],
    providers: [LessonProgressService],
    controllers: [LessonProgressController],
    exports: [LessonProgressService],
})
export class LessonProgressModule {}
