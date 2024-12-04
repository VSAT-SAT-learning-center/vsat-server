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
            where: { id: lessonId, unitArea: { id: unitAreaId } }, // Tìm bài học theo id và unitAreaId
        });
    }

    async findByUnitAreaId(unitAreaId: string): Promise<Lesson[]> {
        return this.lessonRepository.find({
            where: { unitArea: { id: unitAreaId } },
        });
    }

    async createLesson(updateLessonDto: UpdateLessonDto): Promise<Lesson> {
        const { lessonId, title, type, lessonContents } = updateLessonDto;

        // Tìm Lesson theo ID
        let lesson = await this.lessonRepository.findOne({
            where: { id: lessonId },
            relations: ['lessonContents'], // Include lessonContents to process them later
        });

        if (!lesson) {
            throw new NotFoundException('Lesson not found');
        }

        // Cập nhật thông tin của Lesson
        lesson.title = title;
        lesson.type = type;
        await this.lessonRepository.save(lesson);

        // Gọi LessonContentService để xử lý danh sách LessonContents (thêm, xóa, cập nhật)
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

            // Kiểm tra nếu lessonId là chuỗi rỗng, tạo bài học mới với UUID
            if (!lessonData.id || lessonData.id === '') {
                lesson = await this.create({
                    ...lessonData,
                    id: uuidv4(), // Tạo UUID mới cho Lesson
                    unitAreaId,
                });
            } else {
                lesson = await this.findOne(lessonData.id, unitAreaId);

                if (lesson) {
                    // Cập nhật bài học hiện có
                    lesson = await this.update(lesson.id, {
                        ...lessonData,
                        unitAreaId,
                    });
                } else {
                    // Tạo mới bài học nếu không tìm thấy
                    lesson = await this.create({
                        ...lessonData,
                        id: lessonData.id, // Sử dụng ID được cung cấp
                        unitAreaId,
                    });
                }
            }

            lessonIds.push(lesson.id);
        }

        // Xóa các bài học không còn trong danh sách
        await this.removeMissingLessons(unitAreaId, lessonIds);

        return lessonIds;
    }

    async updateLessonsWithContents(
        updateData: UpdateLessonWithContentsDto,
    ): Promise<Lesson> {

        // for (const lessonData of updateData) {
        //     let lesson: Lesson;

        //     if (lessonData.lessonId) {
        //         // Fetch the existing lesson
        //         lesson = await this.lessonRepository.findOne({
        //             where: { id: lessonData.lessonId },
        //             relations: ['lessonContents'], // Load related lesson contents
        //         });

        //         if (!lesson) {
        //             throw new NotFoundException(
        //                 `Lesson with ID ${lessonData.lessonId} not found`,
        //             );
        //         }

        //         // Update lesson fields
        //         // lesson.title = lessonData.title;
        //         // lesson.status = lessonData.status;
        //         // lesson.type = lessonData.type;
        //         // lesson.prerequisitelessonid = lessonData.prerequisitelessonid || null;
        //     } else {
        //         // // Create new lesson
        //         // lesson = this.lessonRepository.create({
        //         //     title: lessonData.title,
        //         //     status: lessonData.status,
        //         //     type: lessonData.type,
        //         //     prerequisitelessonid: lessonData.prerequisitelessonid || null,
        //         // });
        //         console.log('Cong: create lesson!!!')
        //     }

        // Save the lesson
        // const savedLesson = await this.lessonRepository.save(lesson);
        const lesson = await this.lessonRepository.findOne({
            where: { id: updateData.lessonId },
            relations: ['lessonContents'], // Load related lesson contents
        });

        if (!lesson) {
            throw new NotFoundException(
                `Lesson with ID ${updateData.lessonId} not found`,
            );
        }

        // Update lesson contents
        await this.lessonContentService.updateLessonContents(
            lesson,
            updateData.lessonContents,
        );

        return lesson;
    }

    private parseInputToLessonDtos(input: any): UpdateLessonWithContentsDto[] {
        const lessons: UpdateLessonWithContentsDto[] = [];

        // Iterate over unit areas
        input.unitAreas.forEach((unitArea: any) => {
            // Iterate over lessons within each unit area
            unitArea.lessons.forEach((lesson: any) => {
                // Parse lesson contents
                const lessonContents: UpdateContentDto[] = lesson.lessonContents.map(
                    (content: any) => ({
                        id: content.id,
                        title: content.title,
                        contentType: content.contentType,
                        contents: content.contents || [],
                        question: content.question || null,
                        image: content.image || null,
                        url: content.url || null,
                        sort: content.sort || null,
                    }),
                );

                // Parse lesson
                lessons.push({
                    lessonId: lesson.id,
                    title: lesson.title,
                    status: true, // Assuming status is always true when updating
                    type: lesson.type,
                    prerequisitelessonid: lesson.prerequisitelessonid || null,
                    lessonContents: lessonContents,
                });
            });
        });

        return lessons;
    }

    // Tìm kiếm và xóa các bài học không còn trong danh sách lessonIds
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
            relations: ['lessonContents'], // Tải thông tin lessonContents cùng với lesson
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
                                          explain: e.explain || '', // Default to empty string if null
                                      }))
                                    : [], // Default to empty array if no examples
                            }))
                          : [], // Default to empty array if no contents
                      question: content.question
                          ? {
                                questionId: content.question.questionId,
                                prompt: content.question.prompt,
                                correctAnswer: content.question.correctAnswer,
                                explanation: content.question.explanation || '', // Default to empty string if null
                                answers: Array.isArray(content.question.answers)
                                    ? content.question.answers.map((a) => ({
                                          text: a.text,
                                          label: a.label,
                                          answerId: a.answerId,
                                      }))
                                    : [], // Default to empty array if no answers
                            }
                          : null, // Default to null if no question
                  }))
                : [], // Default to empty array if no lessonContents
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
