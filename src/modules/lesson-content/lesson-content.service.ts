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

        // Extract IDs of the existing contents and the incoming contents
        const existingContentIds = existingLessonContents.map(
            (content) => content.id,
        );
        const incomingContentIds = lessonContentsDto.map(
            (contentDto) => contentDto.id,
        );

        // 1. Xóa các LessonContent đã bị xóa từ phía UI (không có trong danh sách mới)
        for (const existingContent of existingLessonContents) {
            if (!incomingContentIds.includes(existingContent.id)) {
                // Xóa lesson content không còn trong danh sách mới
                await this.lessonContentRepository.remove(existingContent);
            }
        }

        // 2. Xử lý cập nhật và thêm mới
        for (const contentDto of lessonContentsDto) {
            let { id, contentType, title, contents, question } = contentDto;

            // Kiểm tra contentType có giá trị hay không
            if (!contentType) {
                throw new Error('Content type is required for lesson content.');
            }

            let lessonContent;

            if (id) {
                // Cập nhật nội dung hiện có nếu tồn tại
                lessonContent = await this.lessonContentRepository.findOne({
                    where: { id, lesson: { id: lesson.id } },
                });

                if (lessonContent) {
                    // Cập nhật nếu lesson content đã tồn tại
                    lessonContent.contentType = contentType;
                    lessonContent.title = title;
                    lessonContent.contents = contents;
                    lessonContent.question = question || null;
                } else {
                    // Nếu không tìm thấy ID thì tạo mới (tránh trường hợp dữ liệu sai)
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
                // Nếu không có ID (dữ liệu mới từ UI), tạo mới nội dung
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
