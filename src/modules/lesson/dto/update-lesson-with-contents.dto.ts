import { ApiProperty } from '@nestjs/swagger';
import { ContentType } from 'src/common/enums/content-type.enum';
import { LessonType } from 'src/common/enums/lesson-type.enum';
import { Content } from 'src/database/entities/embedded-entity/content.embedded';
import { Question } from 'src/database/entities/question.entity';

export class UpdateContentDto {
    @ApiProperty({ description: 'ID of the lesson content', required: false })
    id?: string;

    @ApiProperty({ description: 'Title of the lesson content' })
    title: string;

    @ApiProperty({
        description: 'Content type',
        enum: ContentType,
    })
    contentType: ContentType;

    @ApiProperty({
        description: 'JSON array of content objects',
        required: false,
        isArray: true,
        type: Object,
    })
    contents?: Content[];

    @ApiProperty({
        description: 'Associated question (if any)',
        required: false,
        type: Object,
    })
    question?: Question | null;
}

export class UpdateLessonWithContentsDto {
    @ApiProperty({ description: 'ID of the lesson', required: false })
    lessonId?: string;
    
    @ApiProperty({
        description: 'List of lesson contents',
        type: [UpdateContentDto],
    })
    lessonContents: UpdateContentDto[];
}
