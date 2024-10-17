import { Module } from '@nestjs/common';
import { LearningMaterialService } from './learning-material.service';
import { LearningMaterialController } from './learning-material.controller';
import { UnitModule } from '../unit/unit.module';
import { LessonModule } from '../lesson/lesson.module';
import { UnitAreaModule } from '../unit-area/unit-area.module';

@Module({
    imports: [
        UnitModule,
        UnitAreaModule,
        LessonModule, // Register the entities
    ],
    controllers: [LearningMaterialController],
    providers: [LearningMaterialService],
    exports: [LearningMaterialService],
})
export class LearningMaterialModule {}
