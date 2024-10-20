import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Lesson } from 'src/database/entities/lesson.entity';
import { LessonContent } from 'src/database/entities/lessoncontent.entity';
import { Repository } from 'typeorm';
import { BaseService } from '../base/base.service';
import { LessonService } from '../lesson/lesson.service';
import { CreateLessonContentDto } from './dto/create-lessoncontent.dto';
import { UpdateLessonContentDto } from './dto/update-lessoncontent.dto';

@Injectable()
export class LessonContentService extends BaseService<LessonContent> {
    constructor(
        @InjectRepository(LessonContent)
        private readonly lessonContentRepository: Repository<LessonContent>,
        private readonly lessonService: LessonService,
    ) {
        super(lessonContentRepository);
    }

    async saveLessonContents(
        lesson: Lesson,
        lessonContents: CreateLessonContentDto[],
    ): Promise<void> {
        for (const contentDto of lessonContents) {
            const { contentType, title, contents, question } = contentDto;

            const lessonContent = this.lessonContentRepository.create({
                contentType,
                title,
                contents,
                lesson,
                question: question ? question : null,
            });

            await this.lessonContentRepository.save(lessonContent);
        }
    }

    async getLessonContentsByLesson(lesson: Lesson): Promise<LessonContent[]> {
        return await this.lessonContentRepository.find({
            where: { lesson },
        });
    }

    async findByLessonId(lessonId: string | number): Promise<LessonContent[]> {
        try {
            const entity = await this.lessonContentRepository.find({
                where: { lesson: { id: lessonId } } as any,
            });

            if (!entity) {
                throw new HttpException(
                    `${lessonId} not found`,
                    HttpStatus.NOT_FOUND,
                );
            }

            return entity;
        } catch (error) {
            console.error('Log Error:', error);
            throw new HttpException(
                'Failed to retrieve entity',
                HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }

    async create(
        createLessonContentDto: CreateLessonContentDto,
    ): Promise<LessonContent> {
        const { lessonId, ...lessonContentData } = createLessonContentDto;

        const lesson = await this.lessonService.findOne(lessonId);
        if (!lesson) {
            throw new Error('Lesson not found');
        }

        const newLessonContent = this.lessonContentRepository.create({
            ...lessonContentData,
            lesson: lesson,
        });

        return await this.lessonContentRepository.save(newLessonContent);
    }

    async update(
        id: string,
        updateLessonContentDto: UpdateLessonContentDto,
    ): Promise<LessonContent> {
        const { lessonId, ...lessonContentData } = updateLessonContentDto;

        const lessonContent = await this.findOne(id);
        if (!lessonContent) {
            throw new Error('LessonContent not found');
        }

        const lesson = await this.lessonService.findOne(lessonId);
        if (!lesson) {
            throw new Error('Lesson not found');
        }

        const updatedLessonContent = await this.lessonContentRepository.save({
            ...lessonContent,
            ...lessonContentData, // Update only the fields provided
            lesson: lesson,
        });

        return updatedLessonContent;
    }
}
