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

    async updateLessonProgress(unitAreaProgressId: string, lessonId: string, progress: number): Promise<LessonProgress> {
      // Find lesson and unit area progress
      const lesson = await this.lessonService.findOne(lessonId);
      const unitAreaProgress = await this.unitAreaProgressService.findOne(unitAreaProgressId);
  
      let lessonProgress = await this.lessonProgressRepository.findOne({
        where: {
          lesson: { id: lessonId },
          unitAreaProgress: { id: unitAreaProgressId },
        },
      });
  
      if (lessonProgress) {
        // Update existing lesson progress
        lessonProgress.progress = progress;
      } else {
        // Create new lesson progress
        lessonProgress = this.lessonProgressRepository.create({
          lesson,
          unitAreaProgress,
          progress,
        });
      }
  
      return this.lessonProgressRepository.save(lessonProgress);
    }
  
    async calculateUnitAreaProgress(unitAreaId: string): Promise<number> {
      const lessons = await this.lessonService.findByUnitArea(unitAreaId);
    
      if (lessons.length === 0) {
        return 0;
      }
    
      const progressData = await this.lessonProgressRepository.find({
        where: {
          unitAreaProgress: { unitArea: { id: unitAreaId } }, // Use unitAreaId
          lesson: { id: In(lessons.map(l => l.id)) },
        },
      });
    
      const totalLessons = lessons.length;
      const completedLessons = progressData.filter((p) => p.progress === 100).length;
    
      return (completedLessons / totalLessons) * 100;
    }
}
