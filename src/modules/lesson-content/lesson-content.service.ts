import {
    HttpException,
    HttpStatus,
    Injectable,
    NotFoundException,
    forwardRef,
    Inject,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Lesson } from 'src/database/entities/lesson.entity';
import { LessonContent } from 'src/database/entities/lessoncontent.entity';
import { Repository } from 'typeorm';
import { BaseService } from '../base/base.service';
import { LessonService } from '../lesson/lesson.service';
import { CreateLessonContentDto } from './dto/create-lessoncontent.dto';
import { UpdateLessonContentDto } from './dto/update-lessoncontent.dto';
import { UpdateContentDto } from '../lesson/dto/update-lesson-with-contents.dto';

@Injectable()
export class LessonContentService extends BaseService<LessonContent> {
    constructor(
        @InjectRepository(LessonContent)
        private readonly lessonContentRepository: Repository<LessonContent>,

        @Inject(forwardRef(() => LessonService))
        private readonly lessonService: LessonService,
    ) {
        super(lessonContentRepository);
    }

    async saveLessonContents(
        lesson: Lesson,
        lessonContentsDto: CreateLessonContentDto[],
    ): Promise<void> {
        const existingLessonContents = lesson.lessonContents || [];

        const incomingContentIds = lessonContentsDto.map((contentDto) => contentDto.id);

        for (const existingContent of existingLessonContents) {
            if (!incomingContentIds.includes(existingContent.id)) {
                await this.lessonContentRepository.remove(existingContent);
            }
        }

        for (const contentDto of lessonContentsDto) {
            let { id, contentType, title, contents, question } = contentDto;

            if (!contentType) {
                throw new Error('Content type is required for lesson content.');
            }

            let lessonContent;

            if (id) {
                lessonContent = await this.lessonContentRepository.findOne({
                    where: { id, lesson: { id: lesson.id } },
                });

                if (lessonContent) {
                    lessonContent.contentType = contentType;
                    lessonContent.title = title;
                    lessonContent.contents = contents;
                    lessonContent.question = question || null;
                } else {
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
                lessonContent = this.lessonContentRepository.create({
                    contentType,
                    title,
                    contents,
                    lesson,
                    question: question || null,
                });
            }

            await this.lessonContentRepository.save(lessonContent);
        }
    }

    async updateLessonContents(
        lesson: Lesson,
        contentsData: UpdateContentDto[],
    ): Promise<LessonContent[]> {
        if (!lesson) {
            throw new NotFoundException('Lesson not found');
        }

        const updatedContents: LessonContent[] = [];

        for (const contentData of contentsData) {
            let lessonContent: LessonContent;

            lessonContent = await this.lessonContentRepository.findOne({
                where: { id: contentData.id, lesson: { id: lesson.id } },
            });

            if (!lessonContent) {
                throw new NotFoundException(
                    `LessonContent with ID ${contentData.id} not found`,
                );
            }

            lessonContent = this.lessonContentRepository.merge(
                lessonContent,
                contentData,
            );

            if (contentData.contents) {
                lessonContent.contents = contentData.contents.map((content, index) => ({
                    ...lessonContent.contents?.[index],
                    ...content,
                }));
            }

            await this.lessonContentRepository.save(lessonContent);
            updatedContents.push(lessonContent);
        }

        return updatedContents;
    }

    async create(createLessonContentDto: CreateLessonContentDto): Promise<LessonContent> {
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
            ...lessonContentData,
            lesson: lesson,
        });

        return updatedLessonContent;
    }
}
