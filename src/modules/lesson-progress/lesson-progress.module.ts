import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Lesson } from 'src/database/entities/lesson.entity';
import { LessonProgress } from 'src/database/entities/lessonprogress.entity';
import { UnitAreaProgress } from 'src/database/entities/unitareaprogress.entity';
import { LessonProgressService } from './lesson-progress.service';
import { UnitAreaProgressModule } from '../unit-area-progress/unit-area-progress.module';
import { LessonModule } from '../lesson/lesson.module';
import { UnitProgressModule } from '../unit-progress/unit-progress.module';

@Module({
    imports: [
        TypeOrmModule.forFeature([LessonProgress]),
        forwardRef(() => LessonModule),
        forwardRef(() => UnitAreaProgressModule),
        forwardRef(() => UnitProgressModule)
    ],
    providers: [LessonProgressService],
    exports: [LessonProgressService],
})
export class LessonProgressModule {}
