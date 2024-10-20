import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { CreateLessonProgressDto } from './dto/create-lessonprogress.dto';
import { UpdateLessonProgressDto } from './dto/update-lessonprogress.dto';
import { LessonProgress } from 'src/database/entities/lessonprogress.entity';
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
      const lesson = await this.lessonService.findOneById(lessonId);
      const unitAreaProgress = await this.unitAreaProgressService.findOneById(unitAreaProgressId);
  
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
      const lessons = await this.lessonService.findLessonsByUnitArea(unitAreaId);
    
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

    async create(
      createLessonProgressDto: CreateLessonProgressDto,
  ): Promise<LessonProgress> {
      const { lessonId, unitAreaProgressId, ...lessonProgressData } =
          createLessonProgressDto;

      const lesson = await this.lessonService.findOneById(lessonId);
      if (!lesson) {
          throw new NotFoundException('Lesson not found');
      }

      const unitAreaProgress =
          await this.unitAreaProgressService.findOneById(unitAreaProgressId);
      if (!unitAreaProgress) {
          throw new NotFoundException('UnitAreaProgress not found');
      }

      const newLessonProgress = this.lessonProgressRepository.create({
          ...lessonProgressData,
          unitAreaProgress: unitAreaProgress,
          lesson: lesson,
      });

      return await this.lessonProgressRepository.save(newLessonProgress);
  }

  async update(
      id: string,
      updateLessonProgressDto: UpdateLessonProgressDto,
  ): Promise<LessonProgress> {
      const { lessonId, unitAreaProgressId, ...lessonProgressData } =
          updateLessonProgressDto;

      const lessonProgress = await this.findOneById(id);
      if (!lessonProgress) {
          throw new NotFoundException('LessonProgress not found');
      }

      const lesson = await this.lessonService.findOneById(lessonId);
      if (!lesson) {
          throw new NotFoundException('Lesson not found');
      }

      const unitAreaProgress =
          await this.unitAreaProgressService.findOneById(unitAreaProgressId);

      if (!unitAreaProgress) {
          throw new NotFoundException('UnitAreaProgress not found');
      }

      const updatedLessonProgress = this.lessonProgressRepository.save({
          //...unit,
          ...lessonProgressData,
          unitAreaProgress: unitAreaProgress,
          lesson: lesson,
      
      });
      return updatedLessonProgress;
  }
}
