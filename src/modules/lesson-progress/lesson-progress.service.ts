import {
    forwardRef,
    Inject,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
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
import { ApiOperation } from '@nestjs/swagger';
import { UnitProgressService } from '../unit-progress/unit-progress.service';
import { CompleteLessonProgressDto } from './dto/complete-lesson-progress.dto';

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
        // Find lesson and unit area progress
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
        const lessons =
            await this.lessonService.findLessonsByUnitArea(unitAreaId);

        if (lessons.length === 0) {
            return 0;
        }

        const progressData = await this.lessonProgressRepository.find({
            where: {
                unitAreaProgress: { unitArea: { id: unitAreaId } }, // Use unitAreaId
                lesson: { id: In(lessons.map((l) => l.id)) },
            },
        });

        const totalLessons = lessons.length;
        const completedLessons = progressData.filter(
            (p) => p.progress === 100,
        ).length;

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
            //...unit,
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
        // Kiểm tra xem đã có LessonProgress chưa
        let lessonProgress = await this.lessonProgressRepository.findOne({
            where: {
                lesson: { id: lessonId },
                unitAreaProgress: { id: unitAreaProgressId },
            },
        });

        // Insert LessonProgress mới nếu chưa có
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

    async completeLessonProgressNow(
        lessonId: string,
        targetLearningDetailsId: string,
    ) {
        const lessonProgress = await this.lessonProgressRepository.findOne({
            where: {
                lesson: { id: lessonId },
                targetLearningDetails: { id: targetLearningDetailsId },
            },
            relations: ['unitAreaProgress'],
        });

        if (!lessonProgress) {
            throw new NotFoundException('Lesson progress not found');
        }

        // Cập nhật trạng thái hoàn thành
        lessonProgress.progress = 100;
        lessonProgress.status = ProgressStatus.COMPLETED;

        await this.lessonProgressRepository.save(lessonProgress);

        return lessonProgress;
    }

    // Lấy các bài học đã hoàn thành gần đây theo targetLearningId
    async getRecentCompletedLessons(
        targetLearningId: string,
        limit: number = 5,
    ) {
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
                updatedat: 'DESC', // Sắp xếp theo thời gian cập nhật gần nhất
            },
            take: limit, // Giới hạn số lượng bài học trả về
        });
    }

    // Lấy các bài học đang học gần đây theo targetLearningId
    async getRecentProgressingLessons(
        targetLearningId: string,
        limit: number = 5,
    ) {
        return await this.lessonProgressRepository.find({
            where: {
                unitAreaProgress: {
                    unitProgress: {
                        targetLearningDetail: { id: targetLearningId },
                    },
                },
                status: ProgressStatus.PROGRESSING, // Lọc theo trạng thái Progressing
            },
            relations: ['lesson', 'unitAreaProgress.unitProgress.unit'],
            order: {
                updatedat: 'DESC', // Sắp xếp theo thời gian cập nhật gần nhất
            },
            take: limit, // Giới hạn số lượng bài học trả về
        });
    }

    // Hàm khởi động tiến trình cho bài học khi học sinh bắt đầu học
    async startProgress(
        lessonId: string,
        targetLearningDetailsId: string,
        unitAreaId: string,
        unitId: string,
    ) {
        // 1. Kiểm tra và tạo `UnitProgress` nếu chưa tồn tại
        const unitProgress = await this.unitProgressService.startUnitProgress(
            targetLearningDetailsId,
            unitId,
        );
        // 2. Kiểm tra và tạo `UnitAreaProgress` nếu chưa tồn tại
        const unitAreaProgress = await this.unitAreaProgressService.startUnitAreaProgress(
            targetLearningDetailsId,
            unitAreaId,
            unitProgress.id,
        );
        // 3. Kiểm tra và tạo `LessonProgress` nếu chưa tồn tại
        return await this.startLessonProgress(
            lessonId,
            unitAreaProgress.id,
            targetLearningDetailsId,
        );
    }

    // Hàm cập nhật tiến trình khi học sinh hoàn thành bài học
    async completeLessonProgress(
        lessonId: string,
        lessonProgressDto: CompleteLessonProgressDto,
    ) {
        const { targetLearningDetailsId } = lessonProgressDto;
        // 1. Cập nhật tiến trình cho bài học
        const lessonProgress = await this.completeLessonProgressNow(
            lessonId,
            targetLearningDetailsId,
        );
        const unitAreaProgressId = lessonProgress.unitAreaProgress.id;

        // 2. Cập nhật tiến trình UnitAreaProgress dựa trên các bài học
        const unitProgressId =
            await this.unitAreaProgressService.updateUnitAreaProgressNow(
                unitAreaProgressId,
            );

        // 3. Cập nhật tiến trình UnitProgress dựa trên UnitArea
        await this.unitProgressService.updateUnitProgressNow(
            targetLearningDetailsId,
            unitProgressId,
        );

        return lessonProgress;
    }
}
