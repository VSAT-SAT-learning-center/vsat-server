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

    // async updateUnitProgress(
    //     unitId: string,
    //     targetLearningId: string,
    // ): Promise<UnitProgress> {
    //     const progress = await this.unitAreaProgressService.calculateUnitProgress(unitId);

    //     let unitProgress = await this.unitProgressRepository.findOne({
    //         where: {
    //             unit: { id: unitId },
    //             targetLearningDetail: { id: targetLearningId },
    //         },
    //     });

    //     if (unitProgress) {
    //         unitProgress.progress = progress;
    //     } else {
    //         unitProgress = this.unitProgressRepository.create({
    //             unit: { id: unitId },
    //             targetLearningDetail: { id: targetLearningId },
    //             progress,
    //         });
    //     }

    //     return this.unitProgressRepository.save(unitProgress);
    // }

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

    async getRecentlyLearnedUnits(targetLearningDetail: string): Promise<Unit[]> {
        // Tìm các `UnitProgress` đã có trạng thái IN_PROGRESS hoặc COMPLETED, sắp xếp theo thời gian cập nhật gần đây
        const recentUnits = await this.unitProgressRepository.find({
            where: {
                targetLearningDetail: { id: targetLearningDetail },
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

    async getAllUnitProgress(targetLearningDetailId: string): Promise<any[]> {
        // Step 1: Lấy tất cả UnitProgress dựa theo targetLearningDetailId
        const unitProgresses = await this.unitProgressRepository.find({
            where: { targetLearningDetail: { id: targetLearningDetailId } },
            relations: [
                'unit', // Fetch thông tin Unit
                'unit.level', // Nếu cần level liên quan
                'unit.domain', // Nếu cần domain liên quan
                'unitAreaProgresses', // Fetch UnitAreaProgress liên quan
                'unitAreaProgresses.unitArea', // Fetch UnitArea chi tiết
                'unitAreaProgresses.lessonProgresses', // Fetch LessonProgress liên quan
                'unitAreaProgresses.lessonProgresses.lesson', // Fetch Lesson chi tiết
            ],
        });

        // Step 2: Format dữ liệu trả về
        const response = unitProgresses.map((unitProgress) => {
            return {
                unitId: unitProgress.unit.id,
                unitTitle: unitProgress.unit.title,
                progress: unitProgress.progress || 0,
                status: unitProgress.status,
                unitAreas: unitProgress.unitAreaProgresses.map((unitAreaProgress) => ({
                    unitAreaId: unitAreaProgress.unitArea.id,
                    unitAreaTitle: unitAreaProgress.unitArea.title,
                    progress: unitAreaProgress.progress || 0,
                    status: unitAreaProgress.status,
                    lessons: unitAreaProgress.lessonProgresses.map((lessonProgress) => ({
                        lessonId: lessonProgress.lesson.id,
                        lessonTitle: lessonProgress.lesson.title,
                        progress: lessonProgress.progress || 0,
                        status: lessonProgress.status,
                    })),
                })),
            };
        });

        return response;
    }
    //example reponse: 
    // [
    //     {
    //         "unitId": "unit-123",
    //         "unitTitle": "About the digital SAT",
    //         "progress": 75,
    //         "status": "IN_PROGRESS",
    //         "unitAreas": [
    //             {
    //                 "unitAreaId": "area-456",
    //                 "unitAreaTitle": "Introduction",
    //                 "progress": 50,
    //                 "status": "IN_PROGRESS",
    //                 "lessons": [
    //                     {
    //                         "lessonId": "lesson-789",
    //                         "lessonTitle": "About the digital SAT",
    //                         "progress": 100,
    //                         "status": "COMPLETED"
    //                     },
    //                     {
    //                         "lessonId": "lesson-987",
    //                         "lessonTitle": "SAT Overview",
    //                         "progress": 50,
    //                         "status": "IN_PROGRESS"
    //                     }
    //                 ]
    //             }
    //         ]
    //     }
    // ]
    
}
