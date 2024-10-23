import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LessonContent } from 'src/database/entities/lessoncontent.entity';
import { LessonContentController } from './lesson-content.controller';
import { LessonContentService } from './lesson-content.service';
import { PaginationService } from 'src/common/helpers/pagination.service';
import { LessonModule } from '../lesson/lesson.module';

@Module({
    imports: [
        TypeOrmModule.forFeature([LessonContent]),
        forwardRef(() => LessonModule),
    ],
    controllers: [LessonContentController],
    providers: [LessonContentService],
    exports: [LessonContentService],
})
export class LessonContentModule {}
