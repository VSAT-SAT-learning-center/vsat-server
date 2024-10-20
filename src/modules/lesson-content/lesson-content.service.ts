import { HttpException, HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { LessonContent } from 'src/database/entities/lessoncontent.entity';
import { Repository } from 'typeorm';
import { CreateLessonContentDto } from './dto/create-lessoncontent.dto';
import { UpdateLessonContentDto } from './dto/update-lessoncontent.dto';
import { BaseService } from '../base/base.service';
import { LessonService } from '../lesson/lesson.service';
import { Lesson } from 'src/database/entities/lesson.entity';

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
            let { id, contentType, title, contents, question } = contentDto;
    
            // Kiểm tra contentType có giá trị hay không
            if (!contentType) {
                throw new Error('Content type is required for lesson content.');
            }
    
            let lessonContent;
    
            if (id) {
                // Tìm kiếm nội dung bài học với ID
                lessonContent = await this.lessonContentRepository.findOne({
                    where: { id, lesson: { id: lesson.id } },
                });
    
                if (lessonContent) {
                    // Cập nhật nội dung nếu tìm thấy
                    lessonContent.contentType = contentType;
                    lessonContent.title = title;
                    lessonContent.contents = contents;
                    lessonContent.question = question || null;
                } else {
                    // Tạo mới nếu không tìm thấy nội dung với ID
                    lessonContent = this.lessonContentRepository.create({
                        id,
                        contentType,
                        title,
                        contents,
                        lesson,
                        question: question || null,
                    });
                }
            } else {
                // Tạo mới LessonContent
                lessonContent = this.lessonContentRepository.create({
                    contentType,
                    title,
                    contents,
                    lesson,
                    question: question || null,
                });
            }
    
            // Lưu nội dung vào cơ sở dữ liệu
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

        const lesson = await this.lessonService.findOneById(lessonId);
        if (!lesson) {
            throw new NotFoundException('Lesson not found');
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

        const lessonContent = await this.findOneById(id);
        if (!lessonContent) {
            throw new NotFoundException('LessonContent not found');
        }

        const lesson = await this.lessonService.findOneById(lessonId);
        if (!lesson) {
            throw new NotFoundException('Lesson not found');
        }

        const updatedLessonContent = await this.lessonContentRepository.save({
            ...lessonContent,
            ...lessonContentData, // Update only the fields provided
            lesson: lesson,
        });

        return updatedLessonContent;
    }
}
