import { forwardRef, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateLessonDto } from './dto/create-lesson.dto';
import { UpdateLessonDto } from './dto/update-lesson.dto';
import { Lesson } from 'src/database/entities/lesson.entity';
import { BaseService } from '../base/base.service';
import { UnitAreaService } from '../unit-area/unit-area.service';
import { LessonContentService } from '../lesson-content/lesson-content.service';
import { LessonResponseDto } from './dto/get-lesson.dto';
import { v4 as uuidv4 } from 'uuid';
import {
    UpdateContentDto,
    UpdateLessonWithContentsDto,
} from './dto/update-lesson-with-contents.dto';

@Injectable()
export class LessonService extends BaseService<Lesson> {
    constructor(
        @InjectRepository(Lesson)
        private readonly lessonRepository: Repository<Lesson>,
        private readonly unitAreaService: UnitAreaService,

        @Inject(forwardRef(() => LessonContentService))
        private readonly lessonContentService: LessonContentService,
    ) {
        super(lessonRepository);
    }

    async findOne(lessonId: string, unitAreaId: string): Promise<Lesson> {
        return this.lessonRepository.findOne({
            where: { id: lessonId, unitArea: { id: unitAreaId } }, 
        });
    }

    async findByUnitAreaId(unitAreaId: string): Promise<Lesson[]> {
        return this.lessonRepository.find({
            where: { unitArea: { id: unitAreaId } },
        });
    }

    async createLesson(updateLessonDto: UpdateLessonDto): Promise<Lesson> {
        const { lessonId, title, type, lessonContents } = updateLessonDto;

        let lesson = await this.lessonRepository.findOne({
            where: { id: lessonId },
            relations: ['lessonContents'], 
        });

        if (!lesson) {
            throw new NotFoundException('Lesson not found');
        }

        
        lesson.title = title;
        lesson.type = type;
        await this.lessonRepository.save(lesson);

        
        await this.lessonContentService.saveLessonContents(lesson, lessonContents);

        return lesson;
    }

    async createOrUpdateManyLessons(
        unitAreaId: string,
        lessons: CreateLessonDto[],
    ): Promise<string[]> {
        const lessonIds = [];

        for (const lessonData of lessons) {
            let lesson;

            if (!lessonData.id || lessonData.id === '') {
                lesson = await this.create({
                    ...lessonData,
                    id: uuidv4(), 
                    unitAreaId,
                });
            } else {
                lesson = await this.findOne(lessonData.id, unitAreaId);

                if (lesson) {
                    lesson = await this.update(lesson.id, {
                        ...lessonData,
                        unitAreaId,
                    });
                } else {
                    lesson = await this.create({
                        ...lessonData,
                        id: lessonData.id, 
                        unitAreaId,
                    });
                }
            }

            lessonIds.push(lesson.id);
        }

        await this.removeMissingLessons(unitAreaId, lessonIds);

        return lessonIds;
    }

    async updateLessonsWithContents(
        updateData: UpdateLessonWithContentsDto,
    ): Promise<Lesson> {

        const lesson = await this.lessonRepository.findOne({
            where: { id: updateData.lessonId }
        });

        if (!lesson) {
            throw new NotFoundException(
                `Lesson with ID ${updateData.lessonId} not found`,
            );
        }

        
        await this.lessonContentService.updateLessonContents(
            lesson,
            updateData.lessonContents,
        );

        lesson.status = true;
        const savedLesson = await this.lessonRepository.save(lesson);

        return savedLesson;
    }

    async removeMissingLessons(unitAreaId: string, lessonIds: string[]): Promise<void> {
        const existingLessons = await this.findLessonsByUnitArea(unitAreaId);
        for (const existingLesson of existingLessons) {
            if (!lessonIds.includes(existingLesson.id)) {
                await this.delete(existingLesson);
            }
        }
    }

    async deleteLessonsByUnitArea(unitAreaId: string): Promise<void> {
        const lessons = await this.lessonRepository.find({
            where: { unitArea: { id: unitAreaId } },
        });
        await this.lessonRepository.remove(lessons);
    }

    async getLessonById(id: string): Promise<any> {
        const lesson = await this.lessonRepository.findOne({
            where: { id },
            relations: ['lessonContents'], 
        });

        if (!lesson) {
            throw new NotFoundException('Lesson not found');
        }

        const transformedLesson: LessonResponseDto = {
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
                                questionId: content.question.questionId,
                                prompt: content.question.prompt,
                                correctAnswer: content.question.correctAnswer,
                                explanation: content.question.explanation || '', 
                                answers: Array.isArray(content.question.answers)
                                    ? content.question.answers.map((a) => ({
                                          text: a.text,
                                          label: a.label,
                                          answerId: a.answerId,
                                      }))
                                    : [], 
                            }
                          : null, 
                  }))
                : [], 
        };
        return transformedLesson;
    }

    async findLessonsByUnitArea(unitAreaId: string): Promise<Lesson[]> {
        return this.lessonRepository.find({
            where: { unitArea: { id: unitAreaId } },
        });
    }

    async create(createLessonDto: CreateLessonDto): Promise<Lesson> {
        const { unitAreaId, ...lessonData } = createLessonDto;

        const unitArea = await this.unitAreaService.findOneById(unitAreaId);
        if (!unitArea) {
            throw new NotFoundException('UnitArea not found');
        }

        const newLesson = this.lessonRepository.create({
            ...lessonData,
            unitArea: unitArea,
        });

        return await this.lessonRepository.save(newLesson);
    }

    async updateLessonStatus(id: string, status: boolean): Promise<Lesson> {
        const lesson = await this.findOneById(id);
        if (!lesson) {
            throw new NotFoundException('Lesson not found');
        }

        lesson.status = status;

        const updatedLesson = await this.lessonRepository.save(lesson);

        return updatedLesson;
    }

    async update(id: string, updateLessonDto: UpdateLessonDto): Promise<Lesson> {
        const { unitAreaId, ...lessonData } = updateLessonDto;

        const lesson = await this.findOneById(id);
        if (!lesson) {
            throw new NotFoundException('Lesson not found');
        }

        const unitArea = await this.unitAreaService.findOneById(unitAreaId);
        if (!unitArea) {
            throw new NotFoundException('Unit Area not found');
        }

        this.lessonRepository.merge(lesson, lessonData);

        this.lessonRepository.merge(lesson, lessonData);

        return this.lessonRepository.save(lesson);
    }

    async delete(lesson: Lesson): Promise<void> {
        await this.lessonRepository.remove(lesson);
    }
}
