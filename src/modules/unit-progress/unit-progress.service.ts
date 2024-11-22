import { forwardRef, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ProgressStatus } from 'src/common/enums/progress-status.enum';
import { TargetLearningStatus } from 'src/common/enums/target-learning-status.enum';
import { UnitStatus } from 'src/common/enums/unit-status.enum';
import { LessonProgress } from 'src/database/entities/lessonprogress.entity';
import { TargetLearning } from 'src/database/entities/targetlearning.entity';
import { TargetLearningDetail } from 'src/database/entities/targetlearningdetail.entity';
import { Unit } from 'src/database/entities/unit.entity';
import { UnitArea } from 'src/database/entities/unitarea.entity';
import { UnitAreaProgress } from 'src/database/entities/unitareaprogress.entity';
import { UnitProgress } from 'src/database/entities/unitprogress.entity';
import { In, Repository } from 'typeorm';
import { BaseService } from '../base/base.service';
import { UnitAreaProgressService } from '../unit-area-progress/unit-area-progress.service';
import { UnitAreaService } from '../unit-area/unit-area.service';
import { UnitService } from '../unit/unit.service';
import { UpdateUnitProgressDto } from './dto/update-unitprogress.dto';

@Injectable()
export class UnitProgressService extends BaseService<UnitProgress> {
    constructor(
        @InjectRepository(UnitProgress)
        private readonly unitProgressRepository: Repository<UnitProgress>,
        @InjectRepository(Unit)
        private readonly unitRepository: Repository<Unit>,

        @InjectRepository(TargetLearning)
        private readonly targetLearningRepository: Repository<TargetLearning>,

        @InjectRepository(TargetLearningDetail)
        private readonly targetLearningDetailRepository: Repository<TargetLearningDetail>,

        @InjectRepository(UnitArea)
        private readonly unitAreaRepository: Repository<UnitArea>,

        @InjectRepository(UnitAreaProgress)
        private readonly unitAreaProgressRepository: Repository<UnitAreaProgress>,

        @InjectRepository(LessonProgress)
        private readonly lessonProgressRepository: Repository<LessonProgress>,

        @Inject(forwardRef(() => UnitService))
        private readonly unitService: UnitService,
        @Inject(forwardRef(() => UnitAreaService))
        private readonly unitAreaService: UnitAreaService,
        @Inject(forwardRef(() => UnitAreaProgressService))
        private readonly unitAreaProgressService: UnitAreaProgressService,
    ) {
        super(unitProgressRepository);
    }

    async updateUnitProgressNow(targetLearningId: string, unitProgressId: string) {
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

        const totalUnitAreas = (
            await this.unitAreaService.findByUnitIdWithLessons(unitProgress.unit.id)
        ).length;

        if (totalUnitAreas === 0) {
            throw new NotFoundException('No UnitAreas found for this Unit');
        }

        const completedUnitAreas = unitProgress.unitAreaProgresses.filter(
            (unitAreaProgress) => unitAreaProgress.status === ProgressStatus.COMPLETED,
        ).length;

        const progressPercentage = (completedUnitAreas / totalUnitAreas) * 100;
        unitProgress.progress = progressPercentage;

        if (completedUnitAreas === totalUnitAreas) {
            unitProgress.status = ProgressStatus.COMPLETED;
        } else {
            unitProgress.status = ProgressStatus.PROGRESSING;
        }

        await this.unitProgressRepository.save(unitProgress);

        return unitProgress;
    }

    async startUnitProgress(targetLearningDetailsId: string, unitId: string) {
        let unitProgress = await this.unitProgressRepository.findOne({
            where: {
                unit: { id: unitId },
                targetLearningDetail: { id: targetLearningDetailsId },
            },
        });

        if (!unitProgress) {
            unitProgress = this.unitProgressRepository.create({
                unit: { id: unitId },
                targetLearningDetail: { id: targetLearningDetailsId },
                progress: 0,
                status: ProgressStatus.NOT_STARTED,
            });

            await this.unitProgressRepository.save(unitProgress);
        }

        return unitProgress;
    }

    async startMultipleUnitProgress(targetLearningDetailId: string, unitIds: string[]) {
        console.log(targetLearningDetailId);
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

        //const allUnitProgresses = [...unitProgressList, ...unitsWithProgress];

        // const allUnitIds = allUnitProgresses.map((unitProgress) => unitProgress.unit.id);

        // const allUnitAreas = await this.unitAreaRepository.find({
        //     where: { unit: { id: In(allUnitIds) } },
        //     relations: ['lessons', 'unit'],
        // });

        // const allUnitAreaProgresses = await this.unitAreaProgressRepository.find({
        //     where: {
        //         unitProgress: { id: In(allUnitProgresses.map((up) => up.id)) },
        //     },
        //     relations: ['unitArea'],
        // });

        // const allLessonProgresses = await this.lessonProgressRepository.find({
        //     where: {
        //         unitAreaProgress: {
        //             id: In(allUnitAreaProgresses.map((uap) => uap.id)),
        //         },
        //     },
        //     relations: ['lesson'],
        // });

        // const unitAreaProgressMap = new Map(
        //     allUnitAreaProgresses.map((uap) => [
        //         `${uap.unitArea.id}-${uap.unitProgress.id}`,
        //         uap,
        //     ]),
        // );
        // const lessonProgressMap = new Map(
        //     allLessonProgresses.map((lp) => [
        //         `${lp.lesson.id}-${lp.unitAreaProgress.id}`,
        //         lp,
        //     ]),
        // );

        // const newUnitAreaProgresses = [];
        // const newLessonProgresses = [];

        // for (const unitProgress of allUnitProgresses) {
        //     const unitAreas = allUnitAreas.filter(
        //         (unitArea) => unitArea.unit.id === unitProgress.unit.id,
        //     );

        //     console.log(unitAreas)

        //     for (const unitArea of unitAreas) {
        //         const unitAreaProgressKey = `${unitArea.id}-${unitProgress.id}`;
        //         let unitAreaProgress = unitAreaProgressMap.get(unitAreaProgressKey);

        //         if (!unitAreaProgress) {
        //             unitAreaProgress = this.unitAreaProgressRepository.create({
        //                 unitArea: { id: unitArea.id },
        //                 unitProgress: { id: unitProgress.id },
        //                 progress: 0,
        //                 status: ProgressStatus.NOT_STARTED,
        //             });

        //             newUnitAreaProgresses.push(unitAreaProgress);
        //             unitAreaProgressMap.set(unitAreaProgressKey, unitAreaProgress);
        //         }

        //         for (const lesson of unitArea.lessons) {
        //             const lessonProgressKey = `${lesson.id}-${unitAreaProgress.id}`;
        //             if (!lessonProgressMap.has(lessonProgressKey)) {
        //                 const lessonProgress = this.lessonProgressRepository.create({
        //                     lesson: { id: lesson.id },
        //                     unitAreaProgress: { id: unitAreaProgress.id },
        //                     targetLearningDetails: { id: targetLearningDetailId },
        //                     progress: 0,
        //                     status: ProgressStatus.NOT_STARTED,
        //                 });

        //                 newLessonProgresses.push(lessonProgress);
        //                 lessonProgressMap.set(lessonProgressKey, lessonProgress);
        //             }
        //         }
        //     }
        // }

        // if (newUnitAreaProgresses.length > 0) {
        //     await this.unitAreaProgressRepository.save(newUnitAreaProgresses);
        // }

        // if (newLessonProgresses.length > 0) {
        //     await this.lessonProgressRepository.save(newLessonProgresses);
        // }

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
        const recentUnits = await this.unitProgressRepository.find({
            where: {
                targetLearningDetail: { id: targetLearningDetail },
                status: In([ProgressStatus.PROGRESSING, ProgressStatus.COMPLETED]),
            },
            order: {
                updatedat: 'DESC',
            },
            relations: ['unit'],
            take: 5,
        });

        return recentUnits.map((unitProgress) => unitProgress.unit);
    }

    async getAllUnitProgress(targetLearningDetailId: string): Promise<any[]> {
        const unitProgresses = await this.unitProgressRepository.find({
            where: { targetLearningDetail: { id: targetLearningDetailId } },
            relations: [
                'unit',
                'unit.level',
                'unit.domain',
                'unitAreaProgresses',
                'unitAreaProgresses.unitArea',
                'unitAreaProgresses.lessonProgresses',
                'unitAreaProgresses.lessonProgresses.lesson',
            ],
        });

        const response = unitProgresses.map((unitProgress) => {
            // Calculate counts for unitAreas and lessons
            const unitAreaCount = unitProgress.unitAreaProgresses.length;
            const lessonCount = unitProgress.unitAreaProgresses.reduce(
                (total, unitAreaProgress) =>
                    total + (unitAreaProgress.lessonProgresses?.length || 0),
                0,
            );

            return {
                unitProgressId: unitProgress.id,
                unitId: unitProgress.unit.id,
                unitTitle: unitProgress.unit.title,
                description: unitProgress.unit.description,
                progress: unitProgress.progress || 0,
                status: unitProgress.status,
                unitAreaCount,
                lessonCount,
                unitAreas: unitProgress.unitAreaProgresses.map((unitAreaProgress) => ({
                    unitAreaProgressId: unitAreaProgress.id,
                    unitAreaId: unitAreaProgress.unitArea.id,
                    unitAreaTitle: unitAreaProgress.unitArea.title,
                    progress: unitAreaProgress.progress || 0,
                    status: unitAreaProgress.status,
                    lessons: unitAreaProgress.lessonProgresses.map((lessonProgress) => ({
                        lessonProgressId: lessonProgress.id,
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

    async getUnitProgressDetail(unitProgressId: string): Promise<any> {
        const unitProgress = await this.unitProgressRepository.findOne({
            where: { id: unitProgressId },
            relations: [
                'unit',
                'unit.level',
                'unit.domain',
                'unitAreaProgresses',
                'unitAreaProgresses.unitArea',
                'unitAreaProgresses.lessonProgresses',
                'unitAreaProgresses.lessonProgresses.lesson',
            ],
        });

        if (!unitProgress) {
            throw new NotFoundException(
                `UnitProgress with ID ${unitProgressId} not found.`,
            );
        }

        return {
            unitProgressId: unitProgress.id,
            unitId: unitProgress.unit.id,
            unitTitle: unitProgress.unit.title,
            unitDescription: unitProgress.unit.description,
            progress: unitProgress.progress || 0,
            status: unitProgress.status,
            unitAreas: unitProgress.unitAreaProgresses.map((unitAreaProgress) => ({
                unitAreaProgressId: unitAreaProgress.id,
                unitAreaId: unitAreaProgress.unitArea.id,
                unitAreaTitle: unitAreaProgress.unitArea.title,
                progress: unitAreaProgress.progress || 0,
                status: unitAreaProgress.status,
                lessons: unitAreaProgress.lessonProgresses.map((lessonProgress) => ({
                    lessonProgressId: lessonProgress.id,
                    lessonId: lessonProgress.lesson.id,
                    lessonTitle: lessonProgress.lesson.title,
                    progress: lessonProgress.progress || 0,
                    status: lessonProgress.status,
                })),
            })),
        };
    }

    async getLessonsByUnitProgress(unitProgressId: string): Promise<any> {
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
        targetLearningId: string,
        sectionId: string,
        unitProgressDtos: { unitId: string }[],
    ): Promise<UpdateUnitProgressDto[]> {
        // Step 1: Find TargetLearningDetail based on targetLearningId and sectionId
        const targetLearningDetail = await this.targetLearningDetailRepository.findOne({
            where: {
                targetlearning: { id: targetLearningId },
                section: { id: sectionId },
            },
        });

        if (!targetLearningDetail) {
            throw new NotFoundException(
                `TargetLearningDetail not found for targetLearningId "${targetLearningId}" and sectionId "${sectionId}".`,
            );
        }

        const targetLearningDetailId = targetLearningDetail.id;

        // // Step 2: Existing UnitProgress processing remains the same
        // const existingUnitProgresses = await this.unitProgressRepository.find({
        //     where: { targetLearningDetail: { id: targetLearningDetailId } },
        //     relations: ['unit'],
        // });

        // const existingUnitProgressMap = new Map(
        //     existingUnitProgresses.map((up) => [up.unit.id, up]),
        // );

        // const unitProgressesToInsert = [];
        // const incomingUnitIds = new Set(unitProgressDtos.map((dto) => dto.unitId));

        // for (const dto of unitProgressDtos) {
        //     if (!existingUnitProgressMap.has(dto.unitId)) {
        //         const newUnitProgress = this.unitProgressRepository.create({
        //             unit: { id: dto.unitId },
        //             targetLearningDetail: { id: targetLearningDetailId },
        //             progress: 0,
        //             status: ProgressStatus.NOT_STARTED,
        //         });
        //         unitProgressesToInsert.push(newUnitProgress);
        //     }
        // }

        // const unitProgressesToDelete = existingUnitProgresses.filter(
        //     (up) => !incomingUnitIds.has(up.unit.id),
        // );

        // if (unitProgressesToDelete.length > 0) {
        //     await this.unitProgressRepository.remove(unitProgressesToDelete);
        // }

        // if (unitProgressesToInsert.length > 0) {
        //     await this.unitProgressRepository.save(unitProgressesToInsert);
        // }

        // const updatedUnitProgresses = await this.unitProgressRepository.find({
        //     where: { targetLearningDetail: { id: targetLearningDetailId } },
        //     relations: ['unit'],
        // });

        await this.targetLearningDetailRepository.update(targetLearningDetailId, {
            status: TargetLearningStatus.ACTIVE, // Set status to active
        });

        // Step 2: Delete all existing UnitProgress for this TargetLearningDetail
        await this.unitProgressRepository.delete({
            targetLearningDetail: { id: targetLearningDetailId },
        });

        // Step 3: Insert new UnitProgress entries
        const newUnitProgresses = unitProgressDtos.map((dto) =>
            this.unitProgressRepository.create({
                unit: { id: dto.unitId },
                targetLearningDetail: { id: targetLearningDetailId },
                progress: 0,
                status: ProgressStatus.NOT_STARTED,
            }),
        );

        const savedUnitProgresses =
            await this.unitProgressRepository.save(newUnitProgresses);

        // Step 3: Initialize UnitArea and Lesson Progresses
        await this.initializeUnitAreaAndLessonProgresses(
            savedUnitProgresses,
            targetLearningDetailId,
        );

        return savedUnitProgresses.map((unitProgress) => ({
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
    ): Promise<any> {
        const allUnitIds = allUnitProgresses.map((unitProgress) => unitProgress.unit.id);

        // Fetch UnitAreas and their Lessons in one query
        const allUnitAreas = await this.unitAreaRepository.find({
            where: { unit: { id: In(allUnitIds) } },
            relations: ['unit', 'lessons'],
        });

        // Map UnitAreas by Unit ID for quick lookup
        const unitAreaMap = new Map<string, UnitArea[]>();
        for (const unitArea of allUnitAreas) {
            const unitId = unitArea.unit.id;
            if (!unitAreaMap.has(unitId)) {
                unitAreaMap.set(unitId, []);
            }
            unitAreaMap.get(unitId).push(unitArea);
        }

        // Prepare bulk inserts for UnitAreaProgress and LessonProgress
        const newUnitAreaProgresses: UnitAreaProgress[] = [];
        const newLessonProgresses: LessonProgress[] = [];
        const unitAreaProgressToSave = new Map<string, UnitAreaProgress>();

        for (const unitProgress of allUnitProgresses) {
            const unitAreas = unitAreaMap.get(unitProgress.unit.id) || [];

            for (const unitArea of unitAreas) {
                // Create UnitAreaProgress
                const unitAreaProgress = this.unitAreaProgressRepository.create({
                    unitArea: { id: unitArea.id },
                    unitProgress: { id: unitProgress.id },
                    progress: 0,
                    status: ProgressStatus.NOT_STARTED,
                });
                newUnitAreaProgresses.push(unitAreaProgress);

                // Use the UnitAreaProgress key for corresponding LessonProgress records
                const unitAreaProgressKey = `${unitArea.id}-${unitProgress.id}`;
                unitAreaProgressToSave.set(unitAreaProgressKey, unitAreaProgress);

                for (const lesson of unitArea.lessons) {
                    const lessonProgress = this.lessonProgressRepository.create({
                        lesson: { id: lesson.id },
                        unitAreaProgress, // Directly associate with UnitAreaProgress
                        targetLearningDetails: { id: targetLearningDetailId },
                        progress: 0,
                        status: ProgressStatus.NOT_STARTED,
                    });
                    newLessonProgresses.push(lessonProgress);
                }
            }
        }

        // Batch save UnitAreaProgress records to get IDs
        const savedUnitAreaProgresses =
            await this.unitAreaProgressRepository.save(newUnitAreaProgresses);

        // Map saved UnitAreaProgress IDs back to their respective keys for LessonProgress creation
        savedUnitAreaProgresses.forEach((saved) => {
            const key = `${saved.unitArea.id}-${saved.unitProgress.id}`;
            unitAreaProgressToSave.set(key, saved);
        });

        // Adjust LessonProgress to ensure correct UnitAreaProgress associations
        for (const lessonProgress of newLessonProgresses) {
            const key = `${lessonProgress.unitAreaProgress.unitArea.id}-${lessonProgress.unitAreaProgress.unitProgress.id}`;
            lessonProgress.unitAreaProgress = unitAreaProgressToSave.get(key);
        }

        // Save LessonProgress records
        if (newLessonProgresses.length > 0) {
            await this.lessonProgressRepository.save(newLessonProgresses);
        }

        return savedUnitAreaProgresses;
    }
}
