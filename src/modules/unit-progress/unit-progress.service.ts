import {
    forwardRef,
    Inject,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateUnitProgressDto } from './dto/create-unitprogress.dto';
import { UpdateUnitProgressDto } from './dto/update-unitprogress.dto';
import { UnitProgress } from 'src/database/entities/unitprogress.entity';
import { BaseService } from '../base/base.service';
import { UnitService } from '../unit/unit.service';
import { UnitAreaProgressService } from '../unit-area-progress/unit-area-progress.service';
import { UnitAreaService } from '../unit-area/unit-area.service';
import { ProgressStatus } from 'src/common/enums/progress-status.enum';
import { TargetLearningService } from '../target-learning/target-learning.service';

@Injectable()
export class UnitProgressService extends BaseService<UnitProgress> {
    constructor(
        @InjectRepository(UnitProgress)
        private readonly unitProgressRepository: Repository<UnitProgress>,
        @Inject(forwardRef(() => UnitService))
        private readonly unitService: UnitService,
        private readonly targetLearningService: TargetLearningService,
        private readonly unitAreaService: UnitAreaService,

        @Inject(forwardRef(() => UnitAreaProgressService))
        private readonly unitAreaProgressService: UnitAreaProgressService,
    ) {
        super(unitProgressRepository);
    }

    async create(
        createUnitProgressDto: CreateUnitProgressDto,
    ): Promise<UnitProgress> {
        const { unitId, targetLearningId, ...unitProgressData } =
            createUnitProgressDto;

        const unit = await this.unitService.findOneById(unitId);
        if (!unit) {
            throw new NotFoundException('Unit not found');
        }

        const targetLearning =
            await this.targetLearningService.findOneById(targetLearningId);

        if (!targetLearning) {
            throw new NotFoundException('TargetLearning not found');
        }

        const newUnitProgress = this.unitProgressRepository.create({
            ...unitProgressData,
            targetLearning: targetLearning,
            unit: unit,
        });

        return await this.unitProgressRepository.save(newUnitProgress);
    }

    async update(
        id: string,
        updateUnitProgressDto: UpdateUnitProgressDto,
    ): Promise<UnitProgress> {
        const { unitId, targetLearningId, ...unitProgressData } =
            updateUnitProgressDto;

        const unitProgress = await this.findOneById(id);
        if (!unitProgress) {
            throw new NotFoundException('UnitProgress not found');
        }

        const unit = await this.unitService.findOneById(unitId);
        if (!unit) {
            throw new NotFoundException('Unit not found');
        }

        const targetLearning =
            await this.targetLearningService.findOneById(targetLearningId);
        if (!targetLearning) {
            throw new NotFoundException('TargetLearning not found');
        }

        const updatedUnitProgress = this.unitProgressRepository.save({
            //...unit,
            ...unitProgressData,
            targetLearning: targetLearning,
            unit: unit,
        });

        return updatedUnitProgress;
    }

    async updateUnitProgress(
        unitId: string,
        targetLearningId: string,
    ): Promise<UnitProgress> {
        const progress =
            await this.unitAreaProgressService.calculateUnitProgress(unitId);

        let unitProgress = await this.unitProgressRepository.findOne({
            where: {
                unit: { id: unitId },
                targetLearning: { id: targetLearningId },
            },
        });

        if (unitProgress) {
            unitProgress.progress = progress;
        } else {
            unitProgress = this.unitProgressRepository.create({
                unit: { id: unitId },
                targetLearning: { id: targetLearningId },
                progress,
            });
        }

        return this.unitProgressRepository.save(unitProgress);
    }

    async updateUnitProgressNow(unitId: string,targetLearningId: string, unitProgressId: string) {
        // Lấy UnitProgress dựa trên UnitId và targetLearningId
        const unitProgress = await this.unitProgressRepository.findOne({
            where: {
                id: unitProgressId ,
                targetLearning: { id: targetLearningId },
            },
            relations: ['unitAreaProgresses'],
        });

        if (!unitProgress) {
            throw new NotFoundException('Unit progress not found');
        }

        // //liên quan đến các bài quiz tiên quyết để hoàn thành
        // if (allUnitAreasCompleted) {
        //     // Kiểm tra điểm bài kiểm tra của Unit
        //     const hasPassedExam = await this.examService.hasPassedExam(
        //         targetLearningId,
        //         unitId,
        //     );
        //     if (hasPassedExam) {
        //         // Cập nhật trạng thái UnitProgress thành COMPLETED nếu tất cả UnitArea đã hoàn thành và đạt điểm kiểm tra
        //         unitProgress.status = ProgressStatus.COMPLETED;
        //         unitProgress.progress = 100;
        //         await this.unitProgressRepository.save(unitProgress);
        //     }
        // }

        // Tính toán phần trăm hoàn thành dựa trên số UnitArea đã hoàn thành
        const totalUnitAreas = (
            await this.unitAreaService.findByUnitIdWithLessons(unitId)
        ).length;

        if (totalUnitAreas === 0) {
            throw new NotFoundException('No UnitAreas found for this Unit');
        }

        // Tính số UnitArea đã hoàn thành dựa trên UnitAreaProgress
        const completedUnitAreas = unitProgress.unitAreaProgresses.filter(
            (unitAreaProgress) =>
                unitAreaProgress.status === ProgressStatus.COMPLETED,
        ).length;

        // Cập nhật phần trăm hoàn thành dựa trên tổng số UnitArea
        const progressPercentage = (completedUnitAreas / totalUnitAreas) * 100;
        unitProgress.progress = progressPercentage;

        // Nếu tất cả UnitArea đã hoàn thành, cập nhật trạng thái thành "COMPLETED"
        if (completedUnitAreas === totalUnitAreas) {
            unitProgress.status = ProgressStatus.COMPLETED;
        } else {
            unitProgress.status = ProgressStatus.PROGRESSING;
        }

        await this.unitProgressRepository.save(unitProgress);

        return unitProgress;
    }

    async startUnitProgress(targetLearningId: string, unitId: string) {
        let unitProgress = await this.unitProgressRepository.findOne({
            where: {
                unit: { id: unitId },
                targetLearning: { id: targetLearningId },
            },
        });

        if (!unitProgress) {
            unitProgress = this.unitProgressRepository.create({
                unit: { id: unitId },
                targetLearning: { id: targetLearningId },
                progress: 0,
                status: ProgressStatus.NOT_STARTED,
            });

            await this.unitProgressRepository.save(unitProgress);
        }

        return unitProgress;
    }
}
