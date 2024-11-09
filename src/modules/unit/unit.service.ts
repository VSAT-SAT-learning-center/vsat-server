import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Unit } from 'src/database/entities/unit.entity';
import { Repository } from 'typeorm';
import { CreateUnitDto } from './dto/create-unit.dto';
import { UpdateUnitDto } from './dto/update-unit.dto';
import { BaseService } from '../base/base.service';
import { SectionService } from '../section/section.service';
import { LevelService } from '../level/level.service';
import { PagedUnitResponseDto, UnitResponseDto } from './dto/get-unit.dto';
import { UnitStatus } from 'src/common/enums/unit-status.enum';
import { FeedbackService } from '../feedback/feedback.service';
import { FeedbackStatus } from 'src/common/enums/feedback-status.enum';
import { GetUnitsByUserIdDto } from './dto/get-unit-by-userd.dto';
import { LearningMaterialFeedbackDto } from '../feedback/dto/learning-material-feedback.dto';
import { Feedback } from 'src/database/entities/feedback.entity';
import { DomainService } from '../domain/domain.service';

@Injectable()
export class UnitService extends BaseService<Unit> {
    constructor(
        @InjectRepository(Unit)
        private readonly unitRepository: Repository<Unit>,
        private readonly sectionService: SectionService,
        private readonly levelService: LevelService,
        private readonly domainService: DomainService,

        private readonly feedbackService: FeedbackService,
    ) {
        super(unitRepository);
    }

    async create(createUnitDto: CreateUnitDto): Promise<Unit> {
        const { sectionId, levelId, domainId, ...unitData } = createUnitDto;

        const section = await this.sectionService.findOneById(sectionId);
        if (!section) {
            throw new NotFoundException('Section not found');
        }

        const level = await this.levelService.findById(levelId);
        if (!level) {
            throw new NotFoundException('Level not found');
        }

        const domain = await this.domainService.findOneById(domainId);
        if (!domain) {
            throw new NotFoundException('Domain not found');
        }

        const newUnit = this.unitRepository.create({
            ...unitData,
            section: section,
            level: level,
            domain: domain,
        });

        return await this.unitRepository.save(newUnit);
    }

    async update(id: string, updateUnitDto: UpdateUnitDto): Promise<Unit> {
        const { sectionId, levelId, ...unitData } = updateUnitDto;

        const unit = await this.findOneById(id);
        if (!unit) {
            throw new NotFoundException('Unit not found');
        }

        const section = await this.sectionService.findOneById(sectionId);
        if (!section) {
            throw new NotFoundException('Section not found');
        }

        const level = await this.levelService.findById(levelId);
        if (!level) {
            throw new NotFoundException('Level not found');
        }

        const domain = await this.domainService.findOneById(levelId);
        if (!domain) {
            throw new NotFoundException('Domain not found');
        }

        const updatedUnit = this.unitRepository.save({
            ...unit,
            ...unitData,
            section: section,
            level: level,
            domain: domain,
        });

        return updatedUnit;
    }

    async updateUnitStatus(id: string, updateStatusUnitDto: UpdateUnitDto) {
        const updateUnit = updateStatusUnitDto;

        const unit = await this.findOneById(id);
        if (!unit) {
            throw new NotFoundException('Unit not found');
        }

        await this.unitRepository.save({
            ...unit,
            ...updateUnit,
        });

        return updateUnit;
    }

    async getAllUnitsWithDetails(
        page: number = 1,
        pageSize: number = 10,
    ): Promise<PagedUnitResponseDto> {
        const skip = (page - 1) * pageSize;

        // Fetch all Units along with related UnitAreas, Lessons, Section, Level and Domain
        const [units, totalCount] = await this.unitRepository.findAndCount({
            relations: [
                'section',
                'level',
                'domain',
                'unitAreas',
                'unitAreas.lessons',
                'unitAreas.lessons.lessonContents',
            ],
            order: {
                createdat: 'DESC',
            },
            skip,
            take: pageSize,
        });

        // If no units are found, return an empty array
        if (!units || units.length === 0) {
            return {
                data: [],
                totalItems: 0,
                totalPages: 0,
                currentPage: page,
            };
        }
        const totalPages = Math.ceil(totalCount / pageSize);

        return {
            data: await this.transformedListData(units),
            totalItems: totalCount,
            totalPages,
            currentPage: page,
        };
    }

    async getAllUnitsWithDetailsByUserId(
        page: number = 1,
        pageSize: number = 10,
        filters: GetUnitsByUserIdDto,
    ): Promise<PagedUnitResponseDto> {
        const skip = (page - 1) * pageSize;

        const whereClause: any = { createdby: filters.userId };

        if (filters.name) {
            whereClause.name = filters.name;
        }

        if (filters.status !== undefined) {
            whereClause.status = filters.status;
        }

        if (filters.createdAt) {
            whereClause.createdat = filters.createdAt;
        }

        if (filters.sectionId) {
            whereClause.section = { id: filters.sectionId };
        }

        if (filters.levelId) {
            whereClause.level = { id: filters.levelId };
        }
        // Fetch all Units along with related UnitAreas, Lessons, Section, and Level
        const [units, totalCount] = await this.unitRepository.findAndCount({
            where: whereClause,
            relations: [
                'section',
                'level',
                'unitAreas',
                'unitAreas.lessons',
                'unitAreas.lessons.lessonContents',
            ],
            order: {
                createdat: 'DESC',
            },
            skip,
            take: pageSize,
        });

        // If no units are found, return an empty array
        if (!units || units.length === 0) {
            return {
                data: [],
                totalItems: 0,
                totalPages: 0,
                currentPage: page,
            };
        }
        const totalPages = Math.ceil(totalCount / pageSize);

        return {
            data: await this.transformedListData(units),
            totalItems: totalCount,
            totalPages,
            currentPage: page,
        };
    }

    async getPendingUnitWithDetailsByUserId(
        page: number = 1,
        pageSize: number = 10,
        userId: string,
    ): Promise<PagedUnitResponseDto> {
        const skip = (page - 1) * pageSize;

        // Fetch all Units along with related UnitAreas, Lessons, Section, and Level
        const [units, totalCount] = await this.unitRepository.findAndCount({
            where: { status: UnitStatus.PENDING, createdby: userId },
            relations: [
                'section',
                'level',
                'domain',
                'unitAreas',
                'unitAreas.lessons',
                'unitAreas.lessons.lessonContents',
            ],
            order: {
                createdat: 'DESC',
            },
            skip,
            take: pageSize,
        });

        // If no units are found, return an empty array
        if (!units || units.length === 0) {
            return {
                data: [],
                totalItems: 0,
                totalPages: 0,
                currentPage: page,
            };
        }
        const totalPages = Math.ceil(totalCount / pageSize);

        return {
            data: await this.transformedListData(units),
            totalItems: totalCount,
            totalPages,
            currentPage: page,
        };
    }

    async getApproveUnitWithDetailsByUserId(
        page: number = 1,
        pageSize: number = 10,
        userId: string,
    ): Promise<PagedUnitResponseDto> {
        const skip = (page - 1) * pageSize;

        // Fetch all Units along with related UnitAreas, Lessons, Section, and Level
        const [units, totalCount] = await this.unitRepository.findAndCount({
            where: { status: UnitStatus.APPROVED, createdby: userId },
            relations: [
                'section',
                'level',
                'domain',
                'unitAreas',
                'unitAreas.lessons',
                'unitAreas.lessons.lessonContents',
            ],
            order: {
                createdat: 'DESC',
            },
            skip,
            take: pageSize,
        });

        // If no units are found, return an empty array
        if (!units || units.length === 0) {
            return {
                data: [],
                totalItems: 0,
                totalPages: 0,
                currentPage: page,
            };
        }
        const totalPages = Math.ceil(totalCount / pageSize);

        return {
            data: await this.transformedListData(units),
            totalItems: totalCount,
            totalPages,
            currentPage: page,
        };
    }

    async getRejectUnitWithDetailsByUserId(
        page: number = 1,
        pageSize: number = 10,
        userId: string,
    ): Promise<PagedUnitResponseDto> {
        const skip = (page - 1) * pageSize;

        // Fetch all Units along with related UnitAreas, Lessons, Section, and Level
        const [units, totalCount] = await this.unitRepository.findAndCount({
            where: { status: UnitStatus.REJECTED, createdby: userId },
            relations: [
                'section',
                'level',
                'domain',
                'unitAreas',
                'unitAreas.lessons',
                'unitAreas.lessons.lessonContents',
            ],
            order: {
                createdat: 'DESC',
            },
            skip,
            take: pageSize,
        });

        // If no units are found, return an empty array
        if (!units || units.length === 0) {
            return {
                data: [],
                totalItems: 0,
                totalPages: 0,
                currentPage: page,
            };
        }
        const totalPages = Math.ceil(totalCount / pageSize);

        return {
            data: await this.transformedListData(units),
            totalItems: totalCount,
            totalPages,
            currentPage: page,
        };
    }

    async getDraftUnitWithDetailsByUserId(
        page: number = 1,
        pageSize: number = 10,
        userId: string,
    ): Promise<PagedUnitResponseDto> {
        const skip = (page - 1) * pageSize;

        // Fetch all Units along with related UnitAreas, Lessons, Section, and Level
        const [units, totalCount] = await this.unitRepository.findAndCount({
            where: { status: UnitStatus.DRAFT, createdby: userId },
            relations: [
                'section',
                'level',
                'domain',
                'unitAreas',
                'unitAreas.lessons',
                'unitAreas.lessons.lessonContents',
            ],
            order: {
                createdat: 'DESC',
            },
            skip,
            take: pageSize,
        });

        // If no units are found, return an empty array
        if (!units || units.length === 0) {
            return {
                data: [],
                totalItems: 0,
                totalPages: 0,
                currentPage: page,
            };
        }
        const totalPages = Math.ceil(totalCount / pageSize);

        return {
            data: await this.transformedListData(units),
            totalItems: totalCount,
            totalPages,
            currentPage: page,
        };
    }

    async getPendingUnitWithDetails(
        page: number = 1,
        pageSize: number = 10,
    ): Promise<PagedUnitResponseDto> {
        const skip = (page - 1) * pageSize;

        // Fetch all Units along with related UnitAreas, Lessons, Section, and Level
        const [units, totalCount] = await this.unitRepository.findAndCount({
            where: { status: UnitStatus.PENDING },
            relations: [
                'section',
                'level',
                'domain',
                'unitAreas',
                'unitAreas.lessons',
                'unitAreas.lessons.lessonContents',
            ],
            order: {
                createdat: 'DESC',
            },
            skip,
            take: pageSize,
        });

        // If no units are found, return an empty array
        if (!units || units.length === 0) {
            return {
                data: [],
                totalItems: 0,
                totalPages: 0,
                currentPage: page,
            };
        }
        const totalPages = Math.ceil(totalCount / pageSize);

        return {
            data: await this.transformedListData(units),
            totalItems: totalCount,
            totalPages,
            currentPage: page,
        };
    }

    async getApproveUnitWithDetails(
        page: number = 1,
        pageSize: number = 10,
    ): Promise<PagedUnitResponseDto> {
        const skip = (page - 1) * pageSize;

        // Fetch all Units along with related UnitAreas, Lessons, Section, and Level
        const [units, totalCount] = await this.unitRepository.findAndCount({
            where: { status: UnitStatus.APPROVED },
            relations: [
                'section',
                'level',
                'unitAreas',
                'domain',
                'unitAreas.lessons',
                'unitAreas.lessons.lessonContents',
            ],
            order: {
                createdat: 'DESC',
            },
            skip,
            take: pageSize,
        });

        // If no units are found, return an empty array
        if (!units || units.length === 0) {
            return {
                data: [],
                totalItems: 0,
                totalPages: 0,
                currentPage: page,
            };
        }
        const totalPages = Math.ceil(totalCount / pageSize);

        return {
            data: await this.transformedListData(units),
            totalItems: totalCount,
            totalPages,
            currentPage: page,
        };
    }

    async getRejectUnitWithDetails(
        page: number = 1,
        pageSize: number = 10,
    ): Promise<PagedUnitResponseDto> {
        const skip = (page - 1) * pageSize;

        // Fetch all Units along with related UnitAreas, Lessons, Section, and Level
        const [units, totalCount] = await this.unitRepository.findAndCount({
            where: { status: UnitStatus.REJECTED },
            relations: [
                'section',
                'level',
                'unitAreas',
                'unitAreas.lessons',
                'unitAreas.lessons.lessonContents',
            ],
            order: {
                createdat: 'DESC',
            },
            skip,
            take: pageSize,
        });

        // If no units are found, return an empty array
        if (!units || units.length === 0) {
            return {
                data: [],
                totalItems: 0,
                totalPages: 0,
                currentPage: page,
            };
        }
        const totalPages = Math.ceil(totalCount / pageSize);

        return {
            data: await this.transformedListData(units),
            totalItems: totalCount,
            totalPages,
            currentPage: page,
        };
    }

    async getUnitWithDetails(unitId: string): Promise<UnitResponseDto> {
        // Fetch the Unit along with related UnitAreas, Lessons, and LessonContents
        const unit = await this.unitRepository.findOne({
            where: { id: unitId },
            relations: [
                'section',
                'level',
                'domain',
                'unitAreas',
                'unitAreas.lessons',
                'unitAreas.lessons.lessonContents',
            ],
        });

        // If the unit is not found, throw an error
        if (!unit) {
            throw new NotFoundException(`Unit not found for UnitId: ${unitId}`);
        }

        return this.transformedData(unit);
    }

    async transformedListData(units: any): Promise<UnitResponseDto[]> {
        const transformedData = units.map((unit) => {
            const unitAreaCount = unit.unitAreas?.length || 0;
            const lessonCount = unit.unitAreas.reduce((total, unitArea) => {
                return total + (unitArea.lessons?.length || 0);
            }, 0);

            return {
                id: unit.id,
                title: unit.title,
                description: unit.description,
                createdat: unit.createdat,
                status: unit.status,
                unitAreas: Array.isArray(unit.unitAreas)
                    ? unit.unitAreas.map((unitArea) => ({
                          id: unitArea.id,
                          title: unitArea.title,
                          lessons: Array.isArray(unitArea.lessons)
                              ? unitArea.lessons.map((lesson) => ({
                                    id: lesson.id,
                                    prerequisitelessonid: lesson.prerequisitelessonid,
                                    type: lesson.type,
                                    title: lesson.title,
                                    lessonContents: Array.isArray(lesson.lessonContents)
                                        ? lesson.lessonContents.map((content) => ({
                                              id: content.id,
                                              title: content.title,
                                              contentType: content.contentType,
                                              contents: Array.isArray(content.contents)
                                                  ? content.contents.map((c) => ({
                                                        contentId: c.contentId,
                                                        text: c.text,
                                                        examples: Array.isArray(
                                                            c.examples,
                                                        )
                                                            ? c.examples.map((e) => ({
                                                                  exampleId: e.exampleId,
                                                                  content: e.content,
                                                                  explain:
                                                                      e.explain || '',
                                                              }))
                                                            : [],
                                                    }))
                                                  : [],
                                              question: content.question
                                                  ? {
                                                        questionId:
                                                            content.question.questionId,
                                                        prompt: content.question.prompt,
                                                        correctAnswer:
                                                            content.question
                                                                .correctAnswer,
                                                        explanation:
                                                            content.question
                                                                .explanation || '',
                                                        answers: Array.isArray(
                                                            content.question.answers,
                                                        )
                                                            ? content.question.answers.map(
                                                                  (a) => ({
                                                                      answerId:
                                                                          a.answerId,
                                                                      text: a.text,
                                                                      label: a.label,
                                                                  }),
                                                              )
                                                            : [],
                                                    }
                                                  : null, // Handle null if no question
                                          }))
                                        : [],
                                }))
                              : [],
                      }))
                    : [],
                section: unit.section
                    ? {
                          id: unit.section.id,
                          name: unit.section.name,
                      }
                    : null,
                level: unit.level
                    ? {
                          id: unit.level.id,
                          name: unit.level.name,
                      }
                    : null,
                domain: unit.domain
                    ? {
                          id: unit.domain.id,
                          name: unit.domain.content,
                      }
                    : null,

                // Include counts for unitAreas and lessons
                unitAreaCount,
                lessonCount,
            };
        });

        return transformedData;
    }

    async transformedData(unit: any): Promise<UnitResponseDto> {
        const transformedData: UnitResponseDto = {
            id: unit.id,
            title: unit.title,
            description: unit.description,
            createdAt: unit.createdAt,
            status: unit.status,
            unitAreas: Array.isArray(unit.unitAreas)
                ? unit.unitAreas.map((unitArea) => ({
                      id: unitArea.id,
                      title: unitArea.title,
                      lessons: Array.isArray(unitArea.lessons)
                          ? unitArea.lessons.map((lesson) => ({
                                id: lesson.id,
                                prerequisitelessonid: lesson.prerequisitelessonid,
                                type: lesson.type,
                                title: lesson.title,
                                lessonContents: Array.isArray(lesson.lessonContents)
                                    ? lesson.lessonContents.map((content) => ({
                                          id: content.id,
                                          title: content.title,
                                          contentType: content.contentType,
                                          contents: Array.isArray(content.contents)
                                              ? content.contents.map((c) => ({
                                                    contentId: c.contentId,
                                                    text: c.text,
                                                    examples: Array.isArray(c.examples)
                                                        ? c.examples.map((e) => ({
                                                              exampleId: e.exampleId,
                                                              content: e.content,
                                                              explain: e.explain || '',
                                                          }))
                                                        : [],
                                                }))
                                              : [],
                                          question: content.question
                                              ? {
                                                    questionId:
                                                        content.question.questionId,
                                                    prompt: content.question.prompt,
                                                    correctAnswer:
                                                        content.question.correctAnswer,
                                                    explanation:
                                                        content.question.explanation ||
                                                        '',
                                                    answers: Array.isArray(
                                                        content.question.answers,
                                                    )
                                                        ? content.question.answers.map(
                                                              (a) => ({
                                                                  answerId: a.answerId,
                                                                  text: a.text,
                                                                  label: a.label,
                                                              }),
                                                          )
                                                        : [],
                                                }
                                              : null, // Handle null if no question
                                      }))
                                    : [],
                            }))
                          : [],
                  }))
                : [],
            section: unit.section
                ? {
                      id: unit.section.id,
                      name: unit.section.name,
                  }
                : null,
            level: unit.level
                ? {
                      id: unit.level.id,
                      name: unit.level.name,
                  }
                : null,
            domain: unit.domain
                ? {
                      id: unit.domain.id,
                      name: unit.domain.content,
                  }
                : null,
            unitAreaCount: unit.unitAreaCount,
            lessonCount: unit.lessonCount,
        };

        return await transformedData;
    }

    async submitLearningMaterial(unitId: string): Promise<Unit> {
        const unit = await this.unitRepository.findOne({
            where: { id: unitId },
        });

        if (!unit) {
            throw new Error('Unit not found');
        }

        // Update status to indicate that the learning material has been submitted
        unit.status = UnitStatus.PENDING;
        await this.unitRepository.save(unit);

        this.feedbackService.submitLearningMaterial({
            unit: unit,
            status: FeedbackStatus.PENDING,
            content: 'Learning material submitted',
            accountFromId: unit.createdby,
        });

        return unit;
    }

    async approveOrRejectLearningMaterial(
        feedbackDto: LearningMaterialFeedbackDto,
        action: 'approve' | 'reject',
    ): Promise<Feedback> {
        if (action === 'reject') {
            return await this.rejectLearningMaterial(feedbackDto);
        } else if (action === 'approve') {
            return await this.approveLearningMaterial(feedbackDto);
        }
    }

    private async rejectLearningMaterial(
        feedbackDto: LearningMaterialFeedbackDto,
    ): Promise<Feedback> {
        const unit = await this.unitRepository.findOneBy({
            id: feedbackDto.unitFeedback.unitId,
        });

        if (unit === null) {
            throw new NotFoundException('Unit not found');
        }

        if (unit.countfeedback == 3) {
            unit.isActive = false;
        }

        // Mark the entire unit as rejected
        await this.updateUnitStatus(unit.id, {
            status: UnitStatus.REJECTED,
            countfeedback: unit.countfeedback + 1,
            isActive: unit.isActive,
        });

        feedbackDto.accountToId = unit.createdby;
        return await this.feedbackService.rejectLearningMaterialFeedback(feedbackDto);
    }

    private async approveLearningMaterial(
        feedbackDto: LearningMaterialFeedbackDto,
    ): Promise<Feedback> {
        // Mark the entire unit as approved
        await this.updateUnitStatus(feedbackDto.unitFeedback.unitId, {
            status: UnitStatus.APPROVED,
        });

        return await this.feedbackService.approveLearningMaterialFeedback(feedbackDto);
    }
}
