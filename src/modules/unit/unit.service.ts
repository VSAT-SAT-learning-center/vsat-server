import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Unit } from 'src/database/entities/unit.entity';
import { Repository } from 'typeorm';
import { CreateUnitDto } from './dto/create-unit.dto';
import { UpdateUnitDto } from './dto/update-unit.dto';
import { BaseService } from '../base/base.service';
import { SectionService } from '../section/section.service';
import { LevelService } from '../level/level.service';
import { UnitResponseDto } from './dto/get-unit.dto';

@Injectable()
export class UnitService extends BaseService<Unit> {
    constructor(
        @InjectRepository(Unit)
        private readonly unitRepository: Repository<Unit>,
        private readonly sectionService: SectionService,
        private readonly levelService: LevelService,
    ) {
        super(unitRepository);
    }

    async create(createUnitDto: CreateUnitDto): Promise<Unit> {
        const { sectionId, levelId, ...unitData } = createUnitDto;

        const section = await this.sectionService.findOneById(sectionId);
        if (!section) {
            throw new NotFoundException('Section not found');
        }

        const level = await this.levelService.findById(levelId);
        if (!levelId) {
            throw new NotFoundException('Level not found');
        }

        const newUnit = this.unitRepository.create({
            ...unitData,
            section: section,
            level: level,
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
        if (!levelId) {
            throw new NotFoundException('Level not found');
        }

        const updatedUnit = this.unitRepository.save({
            ...unit,
            ...unitData,
            section: section,
            level: level,
        });

        return updatedUnit;
    }

    async updateUnitStatus(
        id: string,
        updateStatusUnitDto: UpdateUnitDto,
    ): Promise<Unit> {
        const updateUnit = updateStatusUnitDto;

        const unit = await this.findOneById(id);
        if (!unit) {
            throw new NotFoundException('Unit not found');
        }

        const updatedUnit = await this.unitRepository.save({
            ...unit,
            updateUnit,
        });

        return updatedUnit;
    }

    async getUnitWithDetails(unitId: string): Promise<UnitResponseDto> {
        // Fetch the Unit along with related UnitAreas, Lessons, and LessonContents
        const unit = await this.unitRepository.findOne({
            where: { id: unitId },
            relations: [
                'unitAreas',
                'unitAreas.lessons',
                'unitAreas.lessons.lessonContents',
            ],
        });
    
        // If the unit is not found, throw an error
        if (!unit) {
            throw new NotFoundException(`Unit not found for UnitId: ${unitId}`);
        }
    
        // Transform the data into the DTO structure
        const transformedData: UnitResponseDto = {
            id: unit.id,
            title: unit.title,
            description: unit.description,
            unitAreas: Array.isArray(unit.unitAreas) ? unit.unitAreas.map((unitArea) => ({
                id: unitArea.id,
                title: unitArea.title,
                lessons: Array.isArray(unitArea.lessons) ? unitArea.lessons.map((lesson) => ({
                    id: lesson.id,
                    prerequisitelessonid: lesson.prerequisitelessonid,
                    type: lesson.type,
                    title: lesson.title,
                    lessonContents: Array.isArray(lesson.lessonContents) ? lesson.lessonContents.map((content) => ({
                        id: content.id,
                        title: content.title,
                        contentType: content.contentType,
                        contents: Array.isArray(content.contents) ? content.contents.map((c) => ({
                            contentId: c.contentId,
                            text: c.text,
                            examples: Array.isArray(c.examples) ? c.examples.map((e) => ({
                                exampleId: e.exampleId,
                                content: e.content,
                                explain: e.explain || '',
                            })) : [],
                        })) : [],
                        question: content.question
                            ? {
                                questionId: content.question.questionId,
                                prompt: content.question.prompt,
                                correctAnswer: content.question.correctAnswer,
                                explanation: content.question.explanation || '',
                                answers: Array.isArray(content.question.answers) ? content.question.answers.map(
                                    (a) => ({
                                        answerId: a.answerId,
                                        text: a.text,
                                        label: a.label,
                                    }),
                                ) : [],
                            }
                            : null, // Handle null if no question
                    })) : [],
                })) : [],
            })) : [],
        };
    
        return transformedData;
    }
    
}
