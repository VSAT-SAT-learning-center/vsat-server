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
import { UnitAreaProgress } from 'src/database/entities/unitareaprogress.entity';
import { LessonProgress } from 'src/database/entities/lessonprogress.entity';
import { UnitArea } from 'src/database/entities/unitarea.entity';

@Injectable()
export class UnitProgressService extends BaseService<UnitProgress> {
    constructor(
        @InjectRepository(UnitProgress)
        private readonly unitProgressRepository: Repository<UnitProgress>,
        @InjectRepository(Unit)
        private readonly unitRepository: Repository<Unit>,
        @InjectRepository(TargetLearningDetail) // Ensure this is injected
        private readonly targetLearningDetailRepository: Repository<TargetLearningDetail>,

        @InjectRepository(UnitArea)
        private readonly unitAreaRepository: Repository<UnitArea>,

        @InjectRepository(UnitAreaProgress)
        private readonly unitAreaProgressRepository: Repository<UnitAreaProgress>,

        @InjectRepository(LessonProgress)
        private readonly lessonProgressRepository: Repository<LessonProgress>,

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

        // Start UnitAreaProgress and LessonProgress for each UnitProgress
        const allUnitProgresses = [...unitProgressList, ...unitsWithProgress];

        // Step 1: Prepare all data in advance
        const allUnitIds = allUnitProgresses.map((unitProgress) => unitProgress.unit.id);

        // Fetch all UnitAreas for the Units
        const allUnitAreas = await this.unitAreaRepository.find({
            where: { unit: { id: In(allUnitIds) } },
            relations: ['lessons'], // Include lessons
        });

        // Fetch all existing UnitAreaProgress for the current UnitProgresses
        const allUnitAreaProgresses = await this.unitAreaProgressRepository.find({
            where: {
                unitProgress: { id: In(allUnitProgresses.map((up) => up.id)) },
            },
            relations: ['unitArea'],
        });

        // Fetch all existing LessonProgress for the current UnitAreaProgresses
        const allLessonProgresses = await this.lessonProgressRepository.find({
            where: {
                unitAreaProgress: {
                    id: In(allUnitAreaProgresses.map((uap) => uap.id)),
                },
            },
            relations: ['lesson'],
        });

        // Step 2: Create maps for quick lookups
        const unitAreaProgressMap = new Map(
            allUnitAreaProgresses.map((uap) => [
                `${uap.unitArea.id}-${uap.unitProgress.id}`,
                uap,
            ]),
        );
        const lessonProgressMap = new Map(
            allLessonProgresses.map((lp) => [
                `${lp.lesson.id}-${lp.unitAreaProgress.id}`,
                lp,
            ]),
        );

        // Step 3: Initialize new UnitAreaProgress and LessonProgress
        const newUnitAreaProgresses = [];
        const newLessonProgresses = [];

        for (const unitProgress of allUnitProgresses) {
            const unitAreas = allUnitAreas.filter(
                (unitArea) => unitArea.unit.id === unitProgress.unit.id,
            );

            for (const unitArea of unitAreas) {
                const unitAreaProgressKey = `${unitArea.id}-${unitProgress.id}`;
                let unitAreaProgress = unitAreaProgressMap.get(unitAreaProgressKey);

                if (!unitAreaProgress) {
                    unitAreaProgress = this.unitAreaProgressRepository.create({
                        unitArea: { id: unitArea.id },
                        unitProgress: { id: unitProgress.id },
                        progress: 0,
                        status: ProgressStatus.NOT_STARTED,
                    });

                    newUnitAreaProgresses.push(unitAreaProgress);
                    unitAreaProgressMap.set(unitAreaProgressKey, unitAreaProgress);
                }

                for (const lesson of unitArea.lessons) {
                    const lessonProgressKey = `${lesson.id}-${unitAreaProgress.id}`;
                    if (!lessonProgressMap.has(lessonProgressKey)) {
                        const lessonProgress = this.lessonProgressRepository.create({
                            lesson: { id: lesson.id },
                            unitAreaProgress: { id: unitAreaProgress.id },
                            targetLearningDetails: { id: targetLearningDetailId },
                            progress: 0,
                            status: ProgressStatus.NOT_STARTED,
                        });

                        newLessonProgresses.push(lessonProgress);
                        lessonProgressMap.set(lessonProgressKey, lessonProgress);
                    }
                }
            }
        }

        // Step 4: Save new records in batch
        if (newUnitAreaProgresses.length > 0) {
            await this.unitAreaProgressRepository.save(newUnitAreaProgresses);
        }

        if (newLessonProgresses.length > 0) {
            await this.lessonProgressRepository.save(newLessonProgresses);
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

    //include progress
    async getUnitProgressDetail(unitProgressId: string): Promise<any> {
        // Step 1: Fetch UnitProgress chi tiết
        const unitProgress = await this.unitProgressRepository.findOne({
            where: { id: unitProgressId },
            relations: [
                'unit', // Thông tin cơ bản của Unit
                'unit.level', // Nếu cần thông tin level
                'unit.domain', // Nếu cần thông tin domain
                'unitAreaProgresses', // Lấy các UnitAreaProgress liên quan
                'unitAreaProgresses.unitArea', // Lấy thông tin UnitArea
                'unitAreaProgresses.lessonProgresses', // Lấy LessonProgress
                'unitAreaProgresses.lessonProgresses.lesson', // Lấy thông tin Lesson
            ],
        });

        if (!unitProgress) {
            throw new NotFoundException(
                `UnitProgress with ID ${unitProgressId} not found.`,
            );
        }

        // Step 2: Format response
        return {
            unitId: unitProgress.unit.id,
            unitTitle: unitProgress.unit.title,
            unitDescription: unitProgress.unit.description,
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
    }

    //use unit for include content
    async getLessonsByUnitProgress(unitProgressId: string): Promise<any> {
        // Truy vấn UnitProgress và các quan hệ cần thiết
        const unitProgress = await this.unitProgressRepository.findOne({
            where: { id: unitProgressId },
            relations: [
                'unit',
                'unit.unitAreas',
                'unit.unitAreas.lessons',
                'unit.unitAreas.lessons.lessonContents',
            ],
        });

        if (!unitProgress) {
            throw new NotFoundException(
                `UnitProgress with ID ${unitProgressId} not found`,
            );
        }

        // Transform dữ liệu để trả về
        const transformedData = {
            unitProgressId: unitProgress.id,
            progress: unitProgress.progress,
            status: unitProgress.status,
            unit: {
                unitId: unitProgress.unit.id,
                unitTitle: unitProgress.unit.title,
                unitDescription: unitProgress.unit.description,
                unitAreas: unitProgress.unit.unitAreas.map((unitArea) => ({
                    unitAreaId: unitArea.id,
                    unitAreaTitle: unitArea.title,
                    lessons: unitArea.lessons.map((lesson) => ({
                        lessonId: lesson.id,
                        lessonTitle: lesson.title,
                        lessonContents: lesson.lessonContents.map((content) => ({
                            id: content.id,
                            title: content.title,
                            contentType: content.contentType,
                        })),
                    })),
                })),
            },
        };

        return transformedData;
    }

    async syncUnitProgress(
        targetLearningDetailId: string,
        unitProgressDtos: { unitId: string; progress: number; status: ProgressStatus }[],
    ): Promise<UpdateUnitProgressDto[]> {
        // Step 1: Fetch existing UnitProgress records
        const existingUnitProgresses = await this.unitProgressRepository.find({
            where: { targetLearningDetail: { id: targetLearningDetailId } },
            relations: ['unit'],
        });

        // Create a map for quick lookup of existing UnitProgress records
        const existingUnitProgressMap = new Map(
            existingUnitProgresses.map((up) => [up.unit.id, up]),
        );

        // Prepare lists for insert, update, and delete operations
        const unitProgressesToInsert = [];
        const unitProgressesToUpdate = [];
        const incomingUnitIds = new Set(unitProgressDtos.map((dto) => dto.unitId));

        for (const dto of unitProgressDtos) {
            if (existingUnitProgressMap.has(dto.unitId)) {
                // Update existing UnitProgress
                const existingUnitProgress = existingUnitProgressMap.get(dto.unitId);
                existingUnitProgress.progress = dto.progress;
                existingUnitProgress.status = dto.status;
                unitProgressesToUpdate.push(existingUnitProgress);
            } else {
                // Insert new UnitProgress
                const newUnitProgress = this.unitProgressRepository.create({
                    unit: { id: dto.unitId },
                    targetLearningDetail: { id: targetLearningDetailId },
                    progress: dto.progress,
                    status: dto.status,
                });
                unitProgressesToInsert.push(newUnitProgress);
            }
        }

        // Identify UnitProgress records to delete
        const unitProgressesToDelete = existingUnitProgresses.filter(
            (up) => !incomingUnitIds.has(up.unit.id),
        );

        // Step 2: Execute database operations
        // Delete redundant records
        if (unitProgressesToDelete.length > 0) {
            await this.unitProgressRepository.remove(unitProgressesToDelete);
        }

        // Update existing records
        if (unitProgressesToUpdate.length > 0) {
            await this.unitProgressRepository.save(unitProgressesToUpdate);
        }

        // Insert new records
        if (unitProgressesToInsert.length > 0) {
            await this.unitProgressRepository.save(unitProgressesToInsert);
        }

        // Step 3: Fetch updated UnitProgress records
        const updatedUnitProgresses = await this.unitProgressRepository.find({
            where: { targetLearningDetail: { id: targetLearningDetailId } },
            relations: ['unit'],
        });

        // Step 4: Initialize UnitAreaProgress and LessonProgress
        await this.initializeUnitAreaAndLessonProgresses(
            updatedUnitProgresses,
            targetLearningDetailId,
        );

        // Step 5: Return updated UnitProgresses
        return updatedUnitProgresses.map((unitProgress) => ({
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

    async initializeUnitAreaAndLessonProgresses(
        allUnitProgresses: UnitProgress[],
        targetLearningDetailId: string,
    ): Promise<void> {
        const allUnitIds = allUnitProgresses.map((unitProgress) => unitProgress.unit.id);
        const unitProgressIds = allUnitProgresses.map((unitProgress) => unitProgress.id);

        // Fetch all UnitAreas for the Units
        const allUnitAreas = await this.unitAreaRepository.find({
            where: { unit: { id: In(allUnitIds) } },
            relations: ['lessons'], // Include lessons
        });

        // Fetch all existing UnitAreaProgress for the current UnitProgresses
        const allUnitAreaProgresses = await this.unitAreaProgressRepository.find({
            where: {
                unitProgress: { id: In(unitProgressIds) },
            },
            relations: ['unitArea'],
        });

        // Fetch all existing LessonProgress for the current UnitAreaProgresses
        const allLessonProgresses = await this.lessonProgressRepository.find({
            where: {
                unitAreaProgress: {
                    id: In(allUnitAreaProgresses.map((uap) => uap.id)),
                },
            },
            relations: ['lesson'],
        });

        // Step 2: Create maps for quick lookups
        const unitAreaProgressMap = new Map<string, UnitAreaProgress>(
            allUnitAreaProgresses.map((uap) => [
                `${uap.unitArea.id}-${uap.unitProgress.id}`,
                uap,
            ]),
        );
        const lessonProgressMap = new Map<string, LessonProgress>(
            allLessonProgresses.map((lp) => [
                `${lp.lesson.id}-${lp.unitAreaProgress.id}`,
                lp,
            ]),
        );

        // Step 3: Initialize new UnitAreaProgress and LessonProgress
        const newUnitAreaProgresses: UnitAreaProgress[] = [];
        const newLessonProgresses: LessonProgress[] = [];

        for (const unitProgress of allUnitProgresses) {
            const unitAreas = allUnitAreas.filter(
                (unitArea) => unitArea.unit.id === unitProgress.unit.id,
            );

            for (const unitArea of unitAreas) {
                const unitAreaProgressKey = `${unitArea.id}-${unitProgress.id}`;
                let unitAreaProgress = unitAreaProgressMap.get(unitAreaProgressKey);

                if (!unitAreaProgress) {
                    unitAreaProgress = this.unitAreaProgressRepository.create({
                        unitArea: { id: unitArea.id },
                        unitProgress: { id: unitProgress.id },
                        progress: 0,
                        status: ProgressStatus.NOT_STARTED,
                    });

                    newUnitAreaProgresses.push(unitAreaProgress);
                    unitAreaProgressMap.set(unitAreaProgressKey, unitAreaProgress);
                }

                for (const lesson of unitArea.lessons) {
                    const lessonProgressKey = `${lesson.id}-${unitAreaProgress.id}`;
                    if (!lessonProgressMap.has(lessonProgressKey)) {
                        const lessonProgress = this.lessonProgressRepository.create({
                            lesson: { id: lesson.id },
                            unitAreaProgress: { id: unitAreaProgress.id },
                            targetLearningDetails: { id: targetLearningDetailId },
                            progress: 0,
                            status: ProgressStatus.NOT_STARTED,
                        });

                        newLessonProgresses.push(lessonProgress);
                        lessonProgressMap.set(lessonProgressKey, lessonProgress);
                    }
                }
            }
        }

        // Step 4: Save new records in batch
        if (newUnitAreaProgresses.length > 0) {
            await this.unitAreaProgressRepository.save(newUnitAreaProgresses);
        }

        if (newLessonProgresses.length > 0) {
            await this.lessonProgressRepository.save(newLessonProgresses);
        }
    }
}
