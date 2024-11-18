import { forwardRef, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { CreateUnitProgressDto } from './dto/create-unitprogress.dto';
import { UpdateUnitProgressDto } from './dto/update-unitprogress.dto';
import { UnitProgress } from 'src/database/entities/unitprogress.entity';
import { BaseService } from '../base/base.service';
import { UnitService } from '../unit/unit.service';
import { UnitAreaProgressService } from '../unit-area-progress/unit-area-progress.service';
import { UnitAreaService } from '../unit-area/unit-area.service';
import { ProgressStatus } from 'src/common/enums/progress-status.enum';
import { TargetLearningService } from '../target-learning/target-learning.service';
import { Unit } from 'src/database/entities/unit.entity';
import { UnitStatus } from 'src/common/enums/unit-status.enum';
import { TargetLearningDetail } from 'src/database/entities/targetlearningdetail.entity';

@Injectable()
export class UnitProgressService extends BaseService<UnitProgress> {
    constructor(
        @InjectRepository(UnitProgress)
        private readonly unitProgressRepository: Repository<UnitProgress>,
        @InjectRepository(Unit)
        private readonly unitRepository: Repository<Unit>,
        @InjectRepository(TargetLearningDetail) // Ensure this is injected
        private readonly targetLearningDetailRepository: Repository<TargetLearningDetail>,
        @Inject(forwardRef(() => UnitService))
        private readonly unitService: UnitService,
        private readonly unitAreaService: UnitAreaService,
        @Inject(forwardRef(() => UnitAreaProgressService))
        private readonly unitAreaProgressService: UnitAreaProgressService,
    ) {
        super(unitProgressRepository);
    }

    async create(createUnitProgressDto: CreateUnitProgressDto): Promise<UnitProgress> {
        const { unitId, targetLearningDetailId, ...unitProgressData } =
            createUnitProgressDto;

        const unit = await this.unitService.findOneById(unitId);
        if (!unit) {
            throw new NotFoundException('Unit not found');
        }

        const targetLearning = await this.targetLearningDetailRepository.findOne({
            where: { id: targetLearningDetailId },
        });

        if (!targetLearning) {
            throw new NotFoundException('TargetLearning not found');
        }

        const newUnitProgress = this.unitProgressRepository.create({
            ...unitProgressData,
            targetLearningDetail: targetLearning,
            unit: unit,
        });

        return await this.unitProgressRepository.save(newUnitProgress);
    }

    async update(
        id: string,
        updateUnitProgressDto: UpdateUnitProgressDto,
    ): Promise<UnitProgress> {
        const { unitId, targetLearningDetailId, ...unitProgressData } =
            updateUnitProgressDto;

        const unitProgress = await this.findOneById(id);
        if (!unitProgress) {
            throw new NotFoundException('UnitProgress not found');
        }

        const unit = await this.unitService.findOneById(unitId);
        if (!unit) {
            throw new NotFoundException('Unit not found');
        }

        const targetLearning = await this.targetLearningDetailRepository.findOne({
            where: { id: targetLearningDetailId },
        });
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
        const progress = await this.unitAreaProgressService.calculateUnitProgress(unitId);

        let unitProgress = await this.unitProgressRepository.findOne({
            where: {
                unit: { id: unitId },
                targetLearningDetail: { id: targetLearningId },
            },
        });

        if (unitProgress) {
            unitProgress.progress = progress;
        } else {
            unitProgress = this.unitProgressRepository.create({
                unit: { id: unitId },
                targetLearningDetail: { id: targetLearningId },
                progress,
            });
        }

        return this.unitProgressRepository.save(unitProgress);
    }

    async updateUnitProgressNow(
        unitId: string,
        targetLearningId: string,
        unitProgressId: string,
    ) {
        // Lấy UnitProgress dựa trên UnitId và targetLearningId
        const unitProgress = await this.unitProgressRepository.findOne({
            where: {
                id: unitProgressId,
                targetLearningDetail: { id: targetLearningId },
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
            (unitAreaProgress) => unitAreaProgress.status === ProgressStatus.COMPLETED,
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
                targetLearningDetail: { id: targetLearningId },
            },
        });

        if (!unitProgress) {
            unitProgress = this.unitProgressRepository.create({
                unit: { id: unitId },
                targetLearningDetail: { id: targetLearningId },
                progress: 0,
                status: ProgressStatus.NOT_STARTED,
            });

            await this.unitProgressRepository.save(unitProgress);
        }

        return unitProgress;
    }

    async startMultipleUnitProgress(targetLearningDetailId: string, unitIds: string[]) {
        const unitProgressList = [];
        const unitsWithProgress = [];

        for (const unitId of unitIds) {
            let unitProgress = await this.unitProgressRepository.findOne({
                where: {
                    unit: { id: unitId },
                    targetLearningDetail: { id: targetLearningDetailId },
                },
                relations: ['unit', 'unit.level'],
            });

            if (!unitProgress) {
                const unit = await this.unitRepository.findOne({
                    where: { id: unitId, status: UnitStatus.APPROVED },
                    relations: ['level'],
                });

                if (!unit) {
                    throw new NotFoundException(`Unit with id "${unitId}" not found.`);
                }

                unitProgress = this.unitProgressRepository.create({
                    unit,
                    targetLearningDetail: { id: targetLearningDetailId },
                    progress: 0,
                    status: ProgressStatus.NOT_STARTED,
                });

                unitProgressList.push(unitProgress);
            } else {
                unitsWithProgress.push(unitProgress);
            }
        }

        if (unitProgressList.length > 0) {
            await this.unitProgressRepository.save(unitProgressList);
        }

        return [...unitProgressList, ...unitsWithProgress].map((unitProgress) => ({
            id: unitProgress.id,
            progress: unitProgress.progress,
            status: unitProgress.status,
            unit: {
                id: unitProgress.unit.id,
                title: unitProgress.unit.title,
                description: unitProgress.unit.description,
                level: unitProgress.unit.level,
            },
        }));
    }

    async getRecentlyLearnedUnits(targetLearningId: string): Promise<Unit[]> {
        // Tìm các `UnitProgress` đã có trạng thái IN_PROGRESS hoặc COMPLETED, sắp xếp theo thời gian cập nhật gần đây
        const recentUnits = await this.unitProgressRepository.find({
            where: {
                targetLearning: { id: targetLearningId },
                status: In([ProgressStatus.PROGRESSING, ProgressStatus.COMPLETED]),
            },
            order: {
                updatedat: 'DESC', // Sắp xếp từ gần nhất đến xa nhất
            },
            relations: ['unit'], // Lấy quan hệ đến `unit`
            take: 5, // Lấy tối đa 5 `unit` gần đây
        });

        // Trả về danh sách các `unit`
        return recentUnits.map((unitProgress) => unitProgress.unit);
    }
}
