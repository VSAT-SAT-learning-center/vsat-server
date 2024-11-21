import { forwardRef, Inject, Injectable, NotFoundException } from '@nestjs/common';
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

    async create(
        createUnitAreaProgressDto: CreateUnitAreaProgressDto,
    ): Promise<UnitAreaProgress> {
        const { unitAreaId, unitProgressId, ...unitAreaProgressData } =
            createUnitAreaProgressDto;

        const unitArea = await this.unitAreaService.findOneById(unitAreaId);
        if (!unitArea) {
            throw new NotFoundException('UnitArea not found');
        }

        const unitProgress = await this.unitProgressService.findOneById(unitProgressId);
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

        const unitProgress = await this.unitProgressService.findOneById(unitProgressId);

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

    async updateUnitAreaProgressNow(unitAreaProgressId: string) {
        // Lấy UnitAreaProgress dựa trên UnitAreaId và targetLearningId
        const unitAreaProgress = await this.unitAreaProgressRepository.findOne({
            where: {
                id: unitAreaProgressId,
            },
            relations: ['unitArea', 'unitProgress'],
        });

        if (!unitAreaProgress) {
            throw new NotFoundException('UnitArea progress not found');
        }

        // Lấy tổng số bài học thuộc UnitArea
        const totalLessons = (
            await this.lessonService.findByUnitAreaId(unitAreaProgress.unitArea.id)
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
            (lessonProgress) => lessonProgress.status === ProgressStatus.COMPLETED,
        ).length;

        // Cập nhật phần trăm hoàn thành cho UnitArea
        const progressPercentage = (completedLessons / totalLessons) * 100;
        unitAreaProgress.progress = Math.round(progressPercentage);
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
        targetLearningDetailsId: string,
        unitAreaId: string,
        unitProgressId: string,
    ) {
        // Kiểm tra xem đã có UnitAreaProgress chưa
        let unitAreaProgress = await this.unitAreaProgressRepository.findOne({
            where: {
                unitArea: { id: unitAreaId },
                unitProgress: {
                    id: unitProgressId,
                    targetLearningDetail: { id: targetLearningDetailsId },
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

    async getUnitAreaProgressDetails(unitAreaProgressId: string): Promise<any> {
        const unitAreaProgress = await this.unitAreaProgressRepository.findOne({
            where: { id: unitAreaProgressId },
            relations: [
                'unitArea',
                'unitArea.lessons',
                'lessonProgresses',
                'lessonProgresses.lesson',
                'lessonProgresses.lesson.lessonContents', // Ensure lessonContents are fetched
            ],
        });

        if (!unitAreaProgress) {
            throw new NotFoundException(
                `UnitAreaProgress with ID ${unitAreaProgressId} not found.`,
            );
        }

        // Transform lessons to include lessonContents
        const lessonDetails = (unitAreaProgress.unitArea?.lessons || []).map((lesson) => {
            const lessonProgress = unitAreaProgress.lessonProgresses?.find(
                (lp) => lp.lesson?.id === lesson.id,
            );

            return {
                id: lesson.id,
                lessonpProgressId: lessonProgress?.id || null,
                title: lesson.title,
                prerequisitelessonid: lesson.prerequisitelessonid || null,
                type: lesson.type || 'Unknown',
                status: lessonProgress?.status || null,
                progress: lessonProgress?.progress || 0,
                lessonContents: (lessonProgress.lesson.lessonContents || []).map((content) => ({
                    id: content.id,
                    title: content.title,
                    contentType: content.contentType,
                    url: content.url || null,
                    image: content.image || null,
                    contents: (content.contents || []).map((c) => ({
                        contentId: c.contentId,
                        text: c.text,
                        examples: (c.examples || []).map((example) => ({
                            exampleId: example.exampleId,
                            content: example.content,
                            explain: example.explain || '',
                        })),
                    })),
                    question: content.question
                        ? {
                              questionId: content.question.questionId,
                              prompt: content.question.prompt,
                              correctAnswer: content.question.correctAnswer,
                              explanation: content.question.explanation || '',
                              answers: (content.question.answers || []).map((answer) => ({
                                  answerId: answer.answerId,
                                  text: answer.text,
                                  label: answer.label,
                              })),
                          }
                        : null,
                })),
            };
        });

        // Return the transformed response
        return {
            unitAreaProgress: {
                id: unitAreaProgress.id,
                unitAreaProgressId: unitAreaProgress.id,
                progress: unitAreaProgress.progress || 0,
                status: unitAreaProgress.status || null,
                unitArea: {
                    id: unitAreaProgress.unitArea?.id || null,
                    title: unitAreaProgress.unitArea?.title || 'Unknown',
                },
            },
            lessons: lessonDetails,
        };
    }
}
