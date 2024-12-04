import { ApiProperty } from '@nestjs/swagger';
import { ContentType } from 'src/common/enums/content-type.enum';
import { LessonType } from 'src/common/enums/lesson-type.enum';
import { Question } from 'src/database/entities/question.entity';

export class UpdateContentDto {
    @ApiProperty({ description: 'ID of the lesson content', required: false })
    contentId?: string;

    @ApiProperty({ description: 'Title of the lesson content' })
    title: string;

    @ApiProperty({ description: 'Image URL', required: false })
    image?: string;

    @ApiProperty({ description: 'Content URL', required: false })
    url?: string;

    @ApiProperty({ description: 'Sorting order', required: false })
    sort?: number;

    @ApiProperty({
        description: 'Content type',
        enum: ContentType,
    })
    contentType: ContentType;

    @ApiProperty({
        description: 'Contents in JSON format',
        required: false,
        type: Object,
        isArray: true,
    })
    contents?: any[];

    @ApiProperty({
        description: 'Associated question (if any)',
        required: false,
        type: Question,
    })
    question?: Question | null;
}

export class UpdateLessonWithContentsDto {
    @ApiProperty({ description: 'ID of the lesson', required: false })
    lessonId?: string;

    @ApiProperty({ description: 'Title of the lesson' })
    title: string;

    @ApiProperty({ description: 'Status of the lesson' })
    status: boolean;

    @ApiProperty({
        description: 'ID of the prerequisite lesson (if any)',
        required: false,
    })
    prerequisitelessonid?: string;

    @ApiProperty({
        description: 'Type of the lesson',
        enum: LessonType,
    })
    type: LessonType;

    @ApiProperty({
        description: 'List of lesson contents',
        type: [UpdateContentDto],
    })
    lessonContents: UpdateContentDto[];
}
