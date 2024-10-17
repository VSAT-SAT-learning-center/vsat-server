import {
    forwardRef,
    Inject,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UnitArea } from 'src/database/entities/unitarea.entity';
import { CreateUnitAreaDto } from './dto/create-unitarea.dto';
import { UpdateUnitAreaDto } from './dto/update-unitarea.dto';
import { BaseService } from '../base/base.service';
import { PaginationService } from 'src/common/helpers/pagination.service';
import { UnitService } from '../unit/unit.service';
import { PaginationOptionsDto } from 'src/common/dto/pagination-options.dto.ts';
import { Lesson } from 'src/database/entities/lesson.entity';
import { LessonService } from '../lesson/lesson.service';
import { CreateLearningMaterialDto } from '../learning-material/dto/create-learningmaterial.dto';
import { UpdateLearningMaterialDto } from '../learning-material/dto/update-learningmaterial.dto';
import { LessonType } from 'src/common/enums/lesson-type.enum';

@Injectable()
export class UnitAreaService extends BaseService<UnitArea> {
    constructor(
        @InjectRepository(UnitArea)
        private readonly unitAreaRepository: Repository<UnitArea>,
        private readonly unitService: UnitService,

        @Inject(forwardRef(() => LessonService))
        private readonly lessonService: LessonService,
    ) {
        super(unitAreaRepository);
    }
    async createUnitAreaWithLessons(
        createUnitAreaDtoList: CreateLearningMaterialDto[],
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
                throw new NotFoundException(
                    'Lessons are required when creating UnitArea',
                );
            }

            // Create the UnitArea entity using UnitAreaService
            const newUnitArea = await this.create({
                ...unitAreaData,
                unitId: unit.id, // Pass unitId to UnitAreaService
                ...lessons, // Pass lessons array to UnitAreaService
            });

            // Create associated Lessons using LessonService
            const createdLessons = await Promise.all(
                lessons.map((lessonData) =>
                    this.lessonService.create({
                        ...lessonData,
                        unitAreaId: newUnitArea.id, // Pass unitAreaId to LessonService
                        type: LessonType.TEXT,
                    }),
                ),
            );

            // After creating the lessons, you can push the saved UnitArea to the created list
            createdUnitAreas.push({
                ...newUnitArea,
                lessons: createdLessons, // Attach the lessons to UnitArea
            });
        }

        return createdUnitAreas;
    }

    // async updateUnitAreaWithLessons(
    //     id: string,
    //     updateLearningMaterialDto: UpdateLearningMaterialDto,
    // ): Promise<UnitArea> {
    //     const { unitId, lessons, ...unitAreaData } = updateLearningMaterialDto;

    //     // Find the UnitArea by id
    //     const unitArea = await this.findOne(id);
    //     if (!unitArea) {
    //         throw new NotFoundException('UnitArea not found');
    //     }

    //     if (!unitId) {
    //         throw new NotFoundException('Null unitId');
    //     }

    //     const unit = await this.unitService.findOne(unitId);
    //     if (!unit) {
    //         throw new NotFoundException('Unit not found');
    //     }
    //     unitArea.unit = unit;

    //     // Update the UnitArea entity using UnitAreaService
    //     const updatedUnitArea = await this.update(id, {
    //         ...unitAreaData,
    //         unitId: unitId,
    //         lessons: lessons,
    //     });

    //     // Optionally update lessons
    //     if (lessons && lessons.length > 0) {
    //         const updatedLessons = await Promise.all(
    //             lessons.map(async (lessonData) => {
    //                 if (lessonData.id) {
    //                     // If lesson ID is provided, update the existing lesson
    //                     return await this.lessonService.update(lessonData.id, {
    //                         ...lessonData,
    //                     });
    //                 } else {
    //                     // Otherwise, create a new lesson
    //                     return await this.lessonService.create({
    //                         ...lessonData,
    //                         unitAreaId: updatedUnitArea.id,
    //                         title: lessonData.title,
    //                     });
    //                 }
    //             }),
    //         );
    //         return {
    //             ...updatedUnitArea,
    //             lessons: updatedLessons, // Attach updated lessons
    //         };
    //     }

    //     return updatedUnitArea;
    // }

    async findAllWithLessons(
        paginationOptions: PaginationOptionsDto,
    ): Promise<{ data: UnitArea[]; totalItems: number; totalPages: number }> {
        //const filter = unitId ? { unit: { id: unitId } } : {};
        //paginationOptions.filter = filter;
        // Fetch unit areas with lessons as relation
        paginationOptions.relations = ['lessons']; // Đảm bảo bao gồm quan hệ lessons
        return this.findAll(paginationOptions);
    }

    async findByUnitIdWithLessons(unitId: string): Promise<UnitArea[]> {
      const unitAreas = await this.unitAreaRepository.find({
        where: { unit: { id: unitId } }, // Filter by unitId
        relations: ['unit', 'lessons'], // Load related lessons
      });
  
      // If no UnitAreas found, throw an error
      if (!unitAreas || unitAreas.length === 0) {
        throw new NotFoundException(`No UnitAreas found for UnitId: ${unitId}`);
      }
  
      return unitAreas;
    }

    async create(createUnitAreaDto: CreateUnitAreaDto): Promise<UnitArea> {
        const { unitId, ...unitAreaData } = createUnitAreaDto;

        const unit = await this.unitService.findOne(unitId);
        if (!unit) {
            throw new NotFoundException('Unit not found');
        }

        const newUnitArea = this.unitAreaRepository.create({
            ...unitAreaData,
            unit: unit,
        });

        return await this.unitAreaRepository.save(newUnitArea);
    }

    async update(
        id: string,
        updateUnitAreaDto: UpdateUnitAreaDto,
    ): Promise<UnitArea> {
        const { unitId, ...unitAreaData } = updateUnitAreaDto;

        const unitArea = await this.findOne(id);
        if (!unitArea) {
            throw new NotFoundException('UnitArea not found');
        }

        const unit = await this.unitService.findOne(unitId);
        if (!unit) {
            throw new NotFoundException('Unit not found');
        }

        const updatedUnitArea = await this.unitAreaRepository.save({
            ...unitArea,
            ...unitAreaData, // Update only the fields provided
            unit: unit,
        });

        return updatedUnitArea;
    }
}
