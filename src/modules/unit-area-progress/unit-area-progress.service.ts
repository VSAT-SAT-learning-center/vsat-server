import {
    forwardRef,
    Inject,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateUnitAreaProgressDto } from './dto/create-unitareaprogress.dto';
import { UpdateUnitAreaProgressDto } from './dto/update-unitareaprogress.dto';
import { UnitAreaProgress } from 'src/database/entities/unitareaprogress.entity';
import { BaseService } from '../base/base.service';
import { UnitProgressService } from '../unit-progress/unit-progress.service';
import { LessonProgressService } from '../lesson-progress/lesson-progress.service';
import { UnitAreaService } from '../unit-area/unit-area.service';
import { LessonService } from '../lesson/lesson.service';
import { ProgressStatus } from 'src/common/enums/progress-status.enum';
//
@Injectable()
export class UnitAreaProgressService extends BaseService<UnitAreaProgress> {
    constructor(
        @InjectRepository(UnitAreaProgress)
        private readonly unitAreaProgressRepository: Repository<UnitAreaProgress>,
        private readonly unitAreaService: UnitAreaService,
        @Inject(forwardRef(() => UnitProgressService))
        private readonly unitProgressService: UnitProgressService,
        @Inject(forwardRef(() => LessonService))
        private readonly lessonService: LessonService,

        @Inject(forwardRef(() => LessonProgressService))
        private readonly lessonProgressService: LessonProgressService,
    ) {
        super(unitAreaProgressRepository);
    }

    async updateUnitAreaProgress(
        unitProgressId: string,
        unitAreaId: string,
    ): Promise<UnitAreaProgress> {
        const progress =
            await this.lessonProgressService.calculateUnitAreaProgress(
                unitProgressId,
            );

        let unitAreaProgress = await this.unitAreaProgressRepository.findOne({
            where: {
                unitArea: { id: unitAreaId },
                unitProgress: { id: unitProgressId },
            },
        });

        if (unitAreaProgress) {
            unitAreaProgress.progress = progress;
        } else {
            unitAreaProgress = this.unitAreaProgressRepository.create({
                unitArea: { id: unitAreaId },
                unitProgress: { id: unitProgressId },
                progress,
            });
        }

        return this.unitAreaProgressRepository.save(unitAreaProgress);
    }

    async calculateUnitProgress(unitProgressId: string): Promise<number> {
        const unitAreas = await this.unitAreaProgressRepository.find({
            where: { unitProgress: { id: unitProgressId } },
        });

        if (unitAreas.length === 0) return 0;

        const completedUnitAreas = unitAreas.filter(
            (ua) => ua.progress === 100,
        ).length;
        return (completedUnitAreas / unitAreas.length) * 100;
    }

    async create(
        createUnitAreaProgressDto: CreateUnitAreaProgressDto,
    ): Promise<UnitAreaProgress> {
        const { unitAreaId, unitProgressId, ...unitAreaProgressData } =
            createUnitAreaProgressDto;

        const unitArea = await this.unitAreaService.findOneById(unitAreaId);
        if (!unitArea) {
            throw new NotFoundException('UnitArea not found');
        }

        const unitProgress =
            await this.unitProgressService.findOneById(unitProgressId);
        if (!unitProgress) {
            throw new NotFoundException('UnitProgress not found');
        }

        const newUnitAreaProgress = this.unitAreaProgressRepository.create({
            ...unitAreaProgressData,
            unitProgress: unitProgress,
            unitArea: unitArea,
        });

        return await this.unitAreaProgressRepository.save(newUnitAreaProgress);
    }

    async update(
        id: string,
        updateUnitAreaProgressDto: UpdateUnitAreaProgressDto,
    ): Promise<UnitAreaProgress> {
        const { unitAreaId, unitProgressId, ...unitAreaProgressData } =
            updateUnitAreaProgressDto;

        const unitAreaProgress = await this.findOneById(id);
        if (!unitAreaProgress) {
            throw new NotFoundException('UnitAreaProgress not found');
        }

        const unitArea = await this.unitAreaService.findOneById(unitAreaId);
        if (!unitArea) {
            throw new NotFoundException('UnitArea not found');
        }

        const unitProgress =
            await this.unitProgressService.findOneById(unitProgressId);

        if (!unitProgress) {
            throw new NotFoundException('UnitProgress not found');
        }

        const updatedUnitAreaProgress = this.unitAreaProgressRepository.save({
            //...unit,
            ...unitAreaProgressData,
            unitProgress: unitProgress,
            unitArea: unitArea,
        });
        return updatedUnitAreaProgress;
    }

    async updateUnitAreaProgressNow(
        unitAreaId: string,
        unitAreaProgressId: string,
    ) {
        // Lấy UnitAreaProgress dựa trên UnitAreaId và targetLearningId
        const unitAreaProgress = await this.unitAreaProgressRepository.findOne({
            where: {
                id :unitAreaProgressId
            },
            relations: ['unitArea', 'unitProgress'],
        });

        if (!unitAreaProgress) {
            throw new NotFoundException('UnitArea progress not found');
        }

        // Lấy tổng số bài học thuộc UnitArea
        const totalLessons = (
            await this.lessonService.findByUnitAreaId(unitAreaId)
        ).length;

        if (totalLessons === 0) {
            throw new NotFoundException('No lessons found for this UnitArea');
        }

        // Lấy tất cả bài học đã có tiến trình (LessonProgress)
        const lessonProgresses =
            await this.lessonProgressService.getLessonProgressesByUnitAreaProgress(
                unitAreaProgress.id,
            );

        // Tính số lượng bài học đã hoàn thành
        const completedLessons = lessonProgresses.filter(
            (lessonProgress) =>
                lessonProgress.status === ProgressStatus.COMPLETED,
        ).length;

        // Cập nhật phần trăm hoàn thành cho UnitArea
        const progressPercentage = (completedLessons / totalLessons) * 100;
        unitAreaProgress.progress = progressPercentage;

        // Nếu tất cả các bài học trong UnitArea đã hoàn thành, cập nhật trạng thái thành "COMPLETED"
        if (completedLessons === totalLessons) {
            unitAreaProgress.status = ProgressStatus.COMPLETED;
        } else {
            unitAreaProgress.status = ProgressStatus.PROGRESSING;
        }

        await this.unitAreaProgressRepository.save(unitAreaProgress);

        return unitAreaProgress.unitProgress.id; // Trả về UnitProgressId để cập nhật UnitProgress
    }

    async startUnitAreaProgress(
        targetLearningId: string,
        unitAreaId: string,
        unitProgressId: string,
    ) {
        // Kiểm tra xem đã có UnitAreaProgress chưa
        let unitAreaProgress = await this.unitAreaProgressRepository.findOne({
            where: {
                unitArea: { id: unitAreaId },
                unitProgress: {
                    id: unitProgressId,
                    targetLearningDetail: { id: targetLearningId },
                },
            },
        });

        if (!unitAreaProgress) {
            // Insert UnitAreaProgress mới nếu chưa có
            unitAreaProgress = this.unitAreaProgressRepository.create({
                unitArea: { id: unitAreaId },
                unitProgress: { id: unitProgressId },
                progress: 0,
                status: ProgressStatus.NOT_STARTED,
            });

            await this.unitAreaProgressRepository.save(unitAreaProgress);
        }

        return unitAreaProgress;
    }
}
