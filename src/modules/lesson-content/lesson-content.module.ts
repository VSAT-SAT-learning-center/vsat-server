import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LessonContent } from 'src/database/entities/lessoncontent.entity';
import { LessonContentService } from './lesson-content.service';
import { LessonModule } from '../lesson/lesson.module';

@Module({
    imports: [
        TypeOrmModule.forFeature([LessonContent]),
        forwardRef(() => LessonModule),
    ],
    providers: [LessonContentService],
    exports: [LessonContentService],
})
export class LessonContentModule {}
