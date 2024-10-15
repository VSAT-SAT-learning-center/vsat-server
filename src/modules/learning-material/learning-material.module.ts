import { Module } from '@nestjs/common';
import { LearningMaterialService } from './learning-material.service';
import { LearningMaterialController } from './learning-material.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Unit } from 'src/database/entities/unit.entity';
import { UnitArea } from 'src/database/entities/unitarea.entity';
import { Lesson } from 'src/database/entities/lesson.entity';
import { UnitService } from '../unit/unit.service';
import { UnitAreaService } from '../unit-area/unit-area.service';
import { LessonService } from '../lesson/lesson.service';


@Module({
  imports: [
    TypeOrmModule.forFeature([Unit, UnitArea, Lesson]), // Register the entities
  ],
  controllers: [LearningMaterialController],
  providers: [
    LearningMaterialService,
    UnitService,
    UnitAreaService,
    LessonService, // Inject the services needed for handling logic
  ],
  exports: [LearningMaterialService],
})
export class LearningMaterialModule {}
