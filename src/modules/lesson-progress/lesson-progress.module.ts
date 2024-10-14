import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PaginationService } from 'src/common/helpers/pagination.service';
import { Lesson } from 'src/database/entities/lesson.entity';
import { LessonProgress } from 'src/database/entities/lessonprogress.entity';
import { UnitAreaProgress } from 'src/database/entities/unitareaprogress.entity';
import { LessonProgressService } from './lesson-progress.service';
import { LessonProgressController } from './lesson-progress.controller';

@Module({
  imports: [TypeOrmModule.forFeature([LessonProgress, UnitAreaProgress, Lesson])],
  providers: [LessonProgressService, PaginationService],
  controllers: [LessonProgressController],
  exports: [LessonProgressService]
})
export class LessonProgressModule {}
