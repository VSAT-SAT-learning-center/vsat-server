import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LessonService } from './lesson.service';
import { LessonController } from './lesson.controller'
import { Lesson } from 'src/database/entities/lesson.entity';
import { UnitAreaModule } from '../unit-area/unit-area.module';

@Module({
  imports: [TypeOrmModule.forFeature([Lesson]), UnitAreaModule],
  providers: [LessonService],
  controllers: [LessonController],
  exports: [LessonService]
})
export class LessonModule {}
