import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { CreateLessonProgressDto } from './dto/create-lessonprogress.dto';
import { UpdateLessonProgressDto } from './dto/update-lessonprogress.dto';
import { LessonProgress } from 'src/database/entities/lessonprogress.entity';
import { PaginationService } from 'src/common/helpers/pagination.service';
import { PaginationOptionsDto } from 'src/common/dto/pagination-options.dto.ts';
import { BaseService } from '../base/base.service';
import { LessonService } from '../lesson/lesson.service';
import { UnitAreaProgressService } from '../unit-area-progress/unit-area-progress.service';

@Injectable()
export class LessonProgressService extends BaseService<LessonProgress> {
    constructor(
        @InjectRepository(LessonProgress)
        private readonly lessonProgressRepository: Repository<LessonProgress>,
        private readonly unitAreaProgressService: UnitAreaProgressService,
        private readonly lessonService: LessonService,
    ) {
        super(lessonProgressRepository);
    }

    async updateLessonProgress(
        unitAreaProgressId: string,
        lessonId: string,
        progress: number,
    ): Promise<LessonProgress> {
        const lesson = await this.lessonService.findOne(lessonId);
        if (!lesson) {
            throw new Error('Lesson not found');
        }

        const unitAreaProgress =
            await this.unitAreaProgressService.findOne(unitAreaProgressId);
        if (!unitAreaProgress) {
            throw new Error('Unit Area Progress not found');
        }

        const lessonProgress = await this.lessonProgressRepository.findOne({
            where: {
                lesson: { id: lessonId },
                unitAreaProgress: { id: unitAreaProgressId },
            },
        });

        if (lessonProgress) {
          lessonProgress.progress = progress;
          return this.lessonProgressRepository.save(lessonProgress);
        } else {
          const newProgress = this.lessonProgressRepository.create({
            lesson: lesson,
            unitAreaProgress: unitAreaProgress,
            progress: progress,
          });
          return this.lessonProgressRepository.save(newProgress);
        }
    }

    async calculateUnitAreaProgress(
      unitAreaProgressId: string
    ): Promise<number> {
      const paginationOptions: PaginationOptionsDto = {
        filter: { unitAreaId: unitAreaProgressId },
        page: 1,
        pageSize: 1000,
        sortBy: 'id',
        sortOrder: 'ASC',
        relations: [],
      };

      const { data: lessons } = await this.lessonService.findAll(paginationOptions);
    
      // If there are no lessons, return 0 progress
      if (lessons.length === 0) {
        return 0;
      }
    
      // Find all progress records for lessons in the given unit area progress
      const progressData = await this.lessonProgressRepository.find({
        where: {
          unitAreaProgress: { id: unitAreaProgressId }, // Access unitAreaProgress by its id
          lesson: { id: In(lessons.map(l => l.id)) },   // Access lesson via its id
        },
      });
    
      // Calculate completed lessons (where progress is 100)
      const totalLessons = lessons.length;
      const completedLessons = progressData.filter((p) => p.progress === 100).length;
    
      // Return the calculated progress as a percentage
      return (completedLessons / totalLessons) * 100;
    }
    
}
