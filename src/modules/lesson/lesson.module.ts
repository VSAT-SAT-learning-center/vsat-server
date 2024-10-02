import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LessonService } from './lesson.service';
import { LessonController } from './lesson.controller'
import { UnitArea } from 'src/database/entities/unitarea.entity';
import { Lesson } from 'src/database/entities/lesson.entity';
import { PaginationService } from 'src/common/helpers/pagination.service';

@Module({
  imports: [TypeOrmModule.forFeature([Lesson, UnitArea])],
  providers: [LessonService, PaginationService],
  controllers: [LessonController],
})
export class LessonModule {}
