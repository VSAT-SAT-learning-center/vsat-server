import {
    forwardRef,
    Inject,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateLessonDto } from './dto/create-lesson.dto';
import { UpdateLessonDto } from './dto/update-lesson.dto';
import { Lesson } from 'src/database/entities/lesson.entity';
import { BaseService } from '../base/base.service';
import { UnitAreaService } from '../unit-area/unit-area.service';
import { LessonContentService } from '../lesson-content/lesson-content.service';
import { LessonType } from 'src/common/enums/lesson-type.enum';
import { LessonResponseDto } from './dto/get-lesson.dto';

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

    // async updateLessonAndInsertContent(requestData: UpdateLessonDto): Promise<Lesson> {
    //     const { lessonId, lessonTitle, lessonContent } = requestData;

    //     // Step 1: Check if lesson exists, update or create
    //     let lesson: Lesson;
    //     if (lessonId) {
    //         lesson = await this.lessonRepository.findOne({ where: { id: lessonId } });
    //         if (!lesson) {
    //             throw new NotFoundException(`Lesson with ID ${lessonId} not found`);
    //         }
    //         lesson.title = lessonTitle; // Update title if necessary
    //     } else {
    //         lesson = this.lessonRepository.create({ title: lessonTitle });
    //         await this.lessonRepository.save(lesson);
    //     }

    //     // Step 2: Insert or update lesson content
    //     for (const content of lessonContent) {
    //         const { contendId, contentType, contentTitle, content, question } = content;

    //         let lessonContentEntity: LessonContent;

    //         // Check if content already exists, update it
    //         if (contendId) {
    //             lessonContentEntity = await this.lessonContentRepository.findOne({ where: { id: contendId } });
    //             if (!lessonContentEntity) {
    //                 throw new NotFoundException(`Lesson Content with ID ${contendId} not found`);
    //             }
    //             // Update existing content
    //             lessonContentEntity.contentType = contentType;
    //             lessonContentEntity.title = contentTitle;
    //             lessonContentEntity.content = content;
    //         } else {
    //             // Create new content
    //             lessonContentEntity = this.lessonContentRepository.create({
    //                 contentType,
    //                 title: contentTitle,
    //                 content,
    //                 lessonId: lesson.id, // Link to the lesson
    //             });
    //         }

    //         // Save lesson content
    //         await this.lessonContentRepository.save(lessonContentEntity);

    //         // Handle questions if required (future implementation)
    //         if (question) {
    //             // Question handling logic goes here
    //         }
    //     }

    //     // Return the updated lesson with contents
    //     return await this.lessonRepository.findOne({
    //         where: { id: lesson.id },
    //         relations: ['lessonContent'], // Include contents in the response
    //     });
    // }

    async createLesson(updateLessonDto: UpdateLessonDto): Promise<Lesson> {
        const { lessonId, title, type, lessonContents } = updateLessonDto;

        let lesson = await this.lessonRepository.findOne({
            where: { id: lessonId },
        });

        if (!lesson) {
            throw new NotFoundException('Lesson not found');
        }

        lesson.title = title;
        lesson.type = type;
        await this.lessonRepository.save(lesson);

        // Sử dụng LessonContentService để lưu lessonContents (chèn nội dung mới)
        await this.lessonContentService.saveLessonContents(
            lesson,
            lessonContents,
        );

        return lesson;
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

    async findByUnitArea(unitAreaId: string): Promise<Lesson[]> {
        return this.lessonRepository.find({
            where: { unitArea: { id: unitAreaId } },
        });
    }

    async create(createLessonDto: CreateLessonDto): Promise<Lesson> {
        const { unitAreaId, ...lessonData } = createLessonDto;

        const unitArea = await this.unitAreaService.findOne(unitAreaId);
        if (!unitArea) {
            throw new NotFoundException('UnitArea not found');
        }

        const newLesson = this.lessonRepository.create({
            ...lessonData,
            unitArea: unitArea,
        });

        return await this.lessonRepository.save(newLesson);
    }

    async update(
        id: string,
        updateLessonDto: UpdateLessonDto,
    ): Promise<Lesson> {
        const { unitAreaId, ...lessonData } = updateLessonDto;

        const lesson = await this.findOne(id);
        if (!lesson) {
            throw new NotFoundException('Lesson not found');
        }

        const unitArea = await this.unitAreaService.findOne(unitAreaId);
        if (!unitArea) {
            throw new NotFoundException('Unit Area not found');
        }

        const updatedLesson = await this.lessonRepository.save({
            ...lesson,
            ...lessonData,
            unitArea: unitArea,
        });

        return updatedLesson;
    }
}
