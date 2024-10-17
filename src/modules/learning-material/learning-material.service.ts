import { Injectable, NotFoundException } from '@nestjs/common';
import { UnitAreaService } from '../unit-area/unit-area.service';
import { LessonService } from '../lesson/lesson.service';
import { CreateUnitAreaDto } from '../unit-area/dto/create-unitarea.dto';
import { UnitArea } from 'src/database/entities/unitarea.entity';
import { UnitService } from '../unit/unit.service';
import { UpdateUnitAreaDto } from '../unit-area/dto/update-unitarea.dto';
import { CreateLearningMaterialDto } from './dto/create-learningmaterial.dto';

@Injectable()
export class LearningMaterialService {
    constructor(
        private readonly unitService: UnitService,
        private readonly unitAreaService: UnitAreaService,
        private readonly lessonService: LessonService
      ) {
      }

      // async createUnitAreaWithLessons(
      //   createUnitAreaDtoList: CreateLearningMaterialDto[],
      // ): Promise<UnitArea[]> {
      //   const createdUnitAreas: UnitArea[] = [];
    
      //   for (const createUnitAreaDto of createUnitAreaDtoList) {
      //     const { unitId, lessons, ...unitAreaData } = createUnitAreaDto;
    
      //     // Fetch the Unit entity
      //     const unit = await this.unitService.findOne(unitId);
      //     if (!unit) {
      //       throw new NotFoundException('Unit not found');
      //     }
    
      //     // Ensure lessons are provided
      //     if (!lessons || lessons.length === 0) {
      //       throw new NotFoundException('Lessons are required when creating UnitArea');
      //     }
    
      //     // Create the UnitArea entity using UnitAreaService
      //     const newUnitArea = await this.unitAreaService.create({
      //       ...unitAreaData,
      //       unitId: unit.id,  // Pass unitId to UnitAreaService
      //       ...lessons,          // Pass lessons array to UnitAreaService
      //     });
    
      //     // Create associated Lessons using LessonService
      //     const createdLessons = await Promise.all(
      //       lessons.map(lessonData =>
      //         this.lessonService.create({
      //           ...lessonData,
      //           unitAreaId: newUnitArea.id,  // Pass unitAreaId to LessonService
      //         }),
      //       ),
      //     );
    
      //     // After creating the lessons, you can push the saved UnitArea to the created list
      //     createdUnitAreas.push({
      //       ...newUnitArea,
      //       lessons: createdLessons,  // Attach the lessons to UnitArea
      //     });
      //   }
    
      //   return createdUnitAreas;
      // }

      // async updateUnitAreaWithLessons(
      //   updateUnitAreaDtoList: UpdateUnitAreaDto[], // Chứa thông tin UnitArea và Lesson cần update
      // ): Promise<UnitArea[]> {
      //   const updatedUnitAreas: UnitArea[] = [];
      
      //   for (const updateUnitAreaDto of updateUnitAreaDtoList) {
      //     const { unitId, lessons, ...unitAreaData } = updateUnitAreaDto;
      
      //     // Fetch the Unit entity
      //     const unit = await this.unitService.findOne(unitId);
      //     if (!unit) {
      //       throw new NotFoundException('Unit not found');
      //     }
      
      //     // Fetch the existing UnitArea entity or throw an exception if not found
      //     const existingUnitArea = await this.unitAreaService.findOne(updateUnitAreaDto.id);
      //     if (!existingUnitArea) {
      //       throw new NotFoundException(`UnitArea with ID ${updateUnitAreaDto.id} not found`);
      //     }
      
      //     // Ensure lessons are provided
      //     if (!lessons || lessons.length === 0) {
      //       throw new NotFoundException('Lessons are required when updating UnitArea');
      //     }
      
      //     // Update the UnitArea entity using UnitAreaService
      //     const updatedUnitArea = await this.unitAreaService.update(updateUnitAreaDto.id, {
      //       ...unitAreaData,
      //       unitId: unit.id, // Update unitId in UnitArea
      //     });
      
      //     // Fetch existing lessons
      //     const existingLessons = await this.lessonService.findByUnitAreaId(existingUnitArea.id);
      
      //     // Update or create associated lessons using LessonService
      //     const updatedLessons = await Promise.all(
      //       lessons.map(async (lessonData) => {
      //         const existingLesson = existingLessons.find(
      //           (lesson) => lesson.id === lessonData.id,
      //         );
      
      //         if (existingLesson) {
      //           // If lesson exists, update it
      //           return await this.lessonService.update(existingLesson.id, lessonData);
      //         } else {
      //           // If lesson does not exist, create a new one
      //           return await this.lessonService.create({
      //             ...lessonData,
      //             unitAreaId: existingUnitArea.id, // Pass unitAreaId for new lesson
      //           });
      //         }
      //       }),
      //     );
      
      //     // After updating, push the updated UnitArea to the updated list
      //     updatedUnitAreas.push({
      //       ...updatedUnitArea,
      //       lessons: updatedLessons, // Attach the updated or newly created lessons to UnitArea
      //     });
      //   }
      
      //   return updatedUnitAreas;
      // }
      
}
