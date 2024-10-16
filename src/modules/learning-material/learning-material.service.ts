import { Injectable, NotFoundException } from '@nestjs/common';
import { UnitAreaService } from '../unit-area/unit-area.service';
import { LessonService } from '../lesson/lesson.service';
import { CreateUnitAreaDto } from '../unit-area/dto/create-unitarea.dto';
import { UnitArea } from 'src/database/entities/unitarea.entity';
import { UnitService } from '../unit/unit.service';

@Injectable()
export class LearningMaterialService {
    constructor(
        private readonly unitService: UnitService,
        private readonly unitAreaService: UnitAreaService,
        private readonly lessonService: LessonService
      ) {
      }

      async createUnitAreaWithLessons(
        createUnitAreaDtoList: CreateUnitAreaDto[],
      ): Promise<UnitArea[]> {
        const createdUnitAreas: UnitArea[] = [];
    
        for (const createUnitAreaDto of createUnitAreaDtoList) {
          const { unitId, lessons, ...unitAreaData } = createUnitAreaDto;
    
          // Fetch the Unit entity
          const unit = await this.unitService.findOne(unitId);
          if (!unit) {
            throw new NotFoundException('Unit not found');
          }
    
          // Ensure lessons are provided
          if (!lessons || lessons.length === 0) {
            throw new NotFoundException('Lessons are required when creating UnitArea');
          }
    
          // Create the UnitArea entity using UnitAreaService
          const newUnitArea = await this.unitAreaService.create({
            ...unitAreaData,
            unitId: unit.id,  // Pass unitId to UnitAreaService
            lessons,          // Pass lessons array to UnitAreaService
          });
    
          // Create associated Lessons using LessonService
          const createdLessons = await Promise.all(
            lessons.map(lessonData =>
              this.lessonService.create({
                ...lessonData,
                unitAreaId: newUnitArea.id,  // Pass unitAreaId to LessonService
              }),
            ),
          );
    
          // After creating the lessons, you can push the saved UnitArea to the created list
          createdUnitAreas.push({
            ...newUnitArea,
            lessons: createdLessons,  // Attach the lessons to UnitArea
          });
        }
    
        return createdUnitAreas;
      }
}
