import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Level } from 'src/database/entities/level.entity';
import { Section } from 'src/database/entities/section.entity';
import { TargetLearningDetail } from 'src/database/entities/targetlearningdetail.entity';
import { In, Repository } from 'typeorm';
import { CreateTargetLearningDetailDto } from './dto/create-targetlearningdetail.dto';
import { UnitProgress } from 'src/database/entities/unitprogress.entity';

@Injectable()
export class TargetLearningDetailService {
    constructor(
        @InjectRepository(TargetLearningDetail)
        private readonly targetLearningDetailRepository: Repository<TargetLearningDetail>,
        @InjectRepository(Level)
        private readonly levelRepository: Repository<Level>,
        @InjectRepository(Section)
        private readonly sectionRepository: Repository<Section>,

        @InjectRepository(UnitProgress)
        private readonly unitProgressRepository: Repository<UnitProgress>,
    ) {}

    async save(
        createTargetLearningDto: CreateTargetLearningDetailDto,
        targetLearningId: string,
    ): Promise<TargetLearningDetail> {
        const level = await this.levelRepository.findOne({
            where: { id: createTargetLearningDto.levelId },
        });

        const section = await this.sectionRepository.findOne({
            where: { id: createTargetLearningDto.sectionId },
        });

        if (!level) {
            throw new NotFoundException('Level is not found');
        }
        if (!section) {
            throw new NotFoundException('Section is not found');
        }

        const createTargetLearning = await this.targetLearningDetailRepository.create({
            level: level,
            section: section,
            targetlearning: { id: targetLearningId },
        });

        const saveTargetLEarning =
            await this.targetLearningDetailRepository.save(createTargetLearning);

        return saveTargetLEarning;
    }

    async getAllUnitProgress(targetLearningId: string): Promise<any[]> {
        // Step 1: Fetch all TargetLearningDetails for the given TargetLearning ID
        const targetLearningDetails = await this.targetLearningDetailRepository.find({
            where: { targetlearning: { id: targetLearningId } },
            relations: ['section', 'level', 'unitprogress', 'unitprogress.unit'],
        });

        if (targetLearningDetails.length === 0) {
            throw new NotFoundException(
                `No TargetLearningDetails found for TargetLearning ID ${targetLearningId}`,
            );
        }

        // Collect all UnitProgress IDs and their associated details
        const unitProgressIds = targetLearningDetails.flatMap((detail) =>
            detail.unitprogress.map((unitProgress) => unitProgress.id),
        );

        // Step 2: Fetch all UnitProgress with detailed relationships
        const unitProgresses = await this.unitProgressRepository.find({
            where: { id: In(unitProgressIds) },
            relations: [
                'unit',
                'unit.level',
                'unit.domain',
                'unit.unitAreas',
                'unit.unitAreas.lessons',
                'unitAreaProgresses',
                'unitAreaProgresses.unitArea',
                'unitAreaProgresses.lessonProgresses',
                'unitAreaProgresses.lessonProgresses.lesson',
                'targetLearningDetail',
            ],
        });

        // Step 3: Format and structure the response
        const response = targetLearningDetails.map((detail) => ({
            targetLearningDetailId: detail.id,
            section: detail.section
                ? { id: detail.section.id, name: detail.section.name }
                : null,
            level: detail.level ? { id: detail.level.id, name: detail.level.name } : null,
            unitProgresses: unitProgresses
                .filter(
                    (unitProgress) =>
                        unitProgress.targetLearningDetail &&
                        unitProgress.targetLearningDetail.id === detail.id,
                )
                .map((unitProgress) => ({
                    unitId: unitProgress.unit.id,
                    unitTitle: unitProgress.unit.title,
                    level: unitProgress.unit.level
                        ? {
                              id: unitProgress.unit.level.id,
                              name: unitProgress.unit.level.name,
                          }
                        : null,
                    progress: unitProgress.progress || 0,
                    status: unitProgress.status,
                    unitAreaCount: unitProgress.unit.unitAreas.length,
                    lessonCount: unitProgress.unit.unitAreas.reduce(
                        (total, area) => total + (area.lessons?.length || 0),
                        0,
                    ),
                    unitAreas: unitProgress.unitAreaProgresses.map(
                        (unitAreaProgress) => ({
                            unitAreaId: unitAreaProgress.unitArea.id,
                            unitAreaTitle: unitAreaProgress.unitArea.title,
                            progress: unitAreaProgress.progress || 0,
                            status: unitAreaProgress.status,
                            lessons: unitAreaProgress.lessonProgresses.map(
                                (lessonProgress) => ({
                                    lessonId: lessonProgress.lesson.id,
                                    lessonTitle: lessonProgress.lesson.title,
                                    progress: lessonProgress.progress || 0,
                                    status: lessonProgress.status,
                                }),
                            ),
                        }),
                    ),
                })),
        }));

        return response;
    }
}
