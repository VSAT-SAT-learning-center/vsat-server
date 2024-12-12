import { forwardRef, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { CreateLessonProgressDto } from './dto/create-lessonprogress.dto';
import { UpdateLessonProgressDto } from './dto/update-lessonprogress.dto';
import { LessonProgress } from 'src/database/entities/lessonprogress.entity';
import { BaseService } from '../base/base.service';
import { LessonService } from '../lesson/lesson.service';
import { UnitAreaProgressService } from '../unit-area-progress/unit-area-progress.service';
import { UpdateLessonProgressStatusDto } from './dto/update-lessonprogress-status.dto';
import { ProgressStatus } from 'src/common/enums/progress-status.enum';
import { UnitProgressService } from '../unit-progress/unit-progress.service';

@Injectable()
export class LessonProgressService extends BaseService<LessonProgress> {
    constructor(
        @InjectRepository(LessonProgress)
        private readonly lessonProgressRepository: Repository<LessonProgress>,
        @Inject(forwardRef(() => UnitAreaProgressService))
        private readonly unitAreaProgressService: UnitAreaProgressService,
        @Inject(forwardRef(() => LessonService))
        private readonly lessonService: LessonService,
        @Inject(forwardRef(() => UnitProgressService))
        private readonly unitProgressService: UnitProgressService,
    ) {
        super(lessonProgressRepository);
    }

    async updateLessonProgress(
        unitAreaProgressId: string,
        lessonId: string,
        progress: number,
    ): Promise<LessonProgress> {
        const lesson = await this.lessonService.findOneById(lessonId);
        const unitAreaProgress =
            await this.unitAreaProgressService.findOneById(unitAreaProgressId);

        let lessonProgress = await this.lessonProgressRepository.findOne({
            where: {
                lesson: { id: lessonId },
                unitAreaProgress: { id: unitAreaProgressId },
            },
        });

        if (lessonProgress) {
            lessonProgress.progress = progress;
        } else {
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
                unitAreaProgress: { unitArea: { id: unitAreaId } }, 
                lesson: { id: In(lessons.map((l) => l.id)) },
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

    async updateLessonProgressStatus(
        id: string,
        updateLessonProgressStatusDto: UpdateLessonProgressStatusDto,
    ) {
        const updateLessonProgress = updateLessonProgressStatusDto;

        const lessonProgress = await this.findOneById(id);
        if (!lessonProgress) {
            throw new NotFoundException('lessonProgress not found');
        }

        await this.lessonProgressRepository.save({
            ...lessonProgress,
            ...updateLessonProgress,
        });

        return lessonProgress;
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
            ...lessonProgressData,
            unitAreaProgress: unitAreaProgress,
            lesson: lesson,
        });
        return updatedLessonProgress;
    }

    async getLessonProgressesByUnitAreaProgress(
        unitAreaProgressId: string,
    ): Promise<LessonProgress[]> {
        return this.lessonProgressRepository.find({
            where: { unitAreaProgress: { id: unitAreaProgressId } },
        });
    }

    private async startLessonProgress(
        lessonId: string,
        unitAreaProgressId: string,
        targetLearningDetailsId: string,
    ) {
        let lessonProgress = await this.lessonProgressRepository.findOne({
            where: {
                lesson: { id: lessonId },
                unitAreaProgress: { id: unitAreaProgressId },
            },
        });

        if (!lessonProgress) {
            lessonProgress = this.lessonProgressRepository.create({
                lesson: { id: lessonId },
                unitAreaProgress: { id: unitAreaProgressId },
                targetLearningDetails: { id: targetLearningDetailsId },
                progress: 0,
                status: ProgressStatus.PROGRESSING,
            });

            await this.lessonProgressRepository.save(lessonProgress);
        }

        return lessonProgress;
    }

    async completeLessonProgressNow(lessonProgressId: string) {
        const lessonProgress = await this.lessonProgressRepository.findOne({
            where: {
                id: lessonProgressId,
            },
            relations: ['unitAreaProgress'],
        });

        if (!lessonProgress) {
            throw new NotFoundException('Lesson progress not found');
        }

        lessonProgress.progress = 100;
        lessonProgress.status = ProgressStatus.COMPLETED;

        await this.lessonProgressRepository.save(lessonProgress);

        return lessonProgress;
    }

    async getRecentCompletedLessons(targetLearningId: string, limit: number = 5) {
        return await this.lessonProgressRepository.find({
            where: {
                unitAreaProgress: {
                    unitProgress: {
                        targetLearningDetail: { id: targetLearningId },
                    },
                },
                status: ProgressStatus.COMPLETED,
            },
            relations: ['lesson', 'unitAreaProgress.unitProgress.unit'],
            order: {
                updatedat: 'DESC', 
            },
            take: limit,
        });
    }

   
    async getRecentProgressingLessons(targetLearningId: string, limit: number = 5) {
        return await this.lessonProgressRepository.find({
            where: {
                unitAreaProgress: {
                    unitProgress: {
                        targetLearningDetail: { id: targetLearningId },
                    },
                },
                status: ProgressStatus.PROGRESSING,
            },
            relations: ['lesson', 'unitAreaProgress.unitProgress.unit'],
            order: {
                updatedat: 'DESC',
            },
            take: limit, 
        });
    }

    async startProgress(
        lessonId: string,
        targetLearningDetailId: string,
    ) {
        const unitAreaProgress = await this.lessonProgressRepository.findOne({
            where: {
                targetLearningDetails: { id: targetLearningDetailId },
                lesson: { id: lessonId },
            },
            relations: ['unitAreaProgresses'],
        });

        if (!unitAreaProgress) {
            throw new NotFoundException('UnitAreaProgress not found');
        }

        return await this.startLessonProgress(
            lessonId,
            unitAreaProgress.id,
            targetLearningDetailId,
        );
    }

    async completeLessonProgress(lessonProgressId: string) {
        const lessonProgress = await this.completeLessonProgressNow(lessonProgressId);
        const unitAreaProgressId = lessonProgress.unitAreaProgress.id;

        const unitProgressId =
            await this.unitAreaProgressService.updateUnitAreaProgressNow(
                unitAreaProgressId,
            );

        await this.unitProgressService.updateUnitProgressNow(unitProgressId);

        return lessonProgress;
    }
}
