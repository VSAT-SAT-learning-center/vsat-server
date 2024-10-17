import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateLessonDto } from './dto/create-lesson.dto';
import { UpdateLessonDto } from './dto/update-lesson.dto';
import { Lesson } from 'src/database/entities/lesson.entity';
import { BaseService } from '../base/base.service';
import { UnitAreaService } from '../unit-area/unit-area.service';

@Injectable()
export class LessonService extends BaseService<Lesson> {
    constructor(
        @InjectRepository(Lesson)
        private readonly lessonRepository: Repository<Lesson>,
        private readonly unitAreaService: UnitAreaService,
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
