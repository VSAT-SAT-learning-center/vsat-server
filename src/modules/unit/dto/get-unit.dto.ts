import { Expose } from 'class-transformer';
import { PaginationOptionsDto } from 'src/common/dto/pagination-options.dto.ts';
import { ContentType } from 'src/common/enums/content-type.enum';
import { LessonType } from 'src/common/enums/lesson-type.enum';
import { UnitStatus } from 'src/common/enums/unit-status.enum';

export class GetUnitDTO {
    @Expose()
    id: string;

    @Expose()
    title: string;

    @Expose()
    description: string;
}

export class ContentDto {
    contentId: string;
    text: string;
    examples: ExampleDto[];
}

export class ExampleDto {
    exampleId: string;
    content: string;
    explain?: string;
}

export class QuestionDto {
    questionId: string;
    prompt: string;
    correctAnswer: string;
    explanation?: string;
    answers: AnswerDto[];
}

export class AnswerDto {
    answerId: string;
    text: string;
    label: string;
}

export class LessonContentDto {
    id: string;
    title: string;
    contentType: ContentType;
    contents: ContentDto[];
    question: QuestionDto | null;
}

export class LessonDto {
    id: string;
    prerequisitelessonid: string;
    type: LessonType;
    title: string;
    lessonContents: LessonContentDto[];
}

export class SectionDto {
    id: string;
    name: string;
}

export class LevelDto {
    id: string;
    name: string;
}
export class UnitAreaDto {
    id: string;
    title: string;
    lessons: LessonDto[];
}

export class UnitResponseDto {
    id: string;
    createdAt: Date;
    title: string;
    description: string;
    status?: UnitStatus;
    section: SectionDto;
    level: LevelDto;
    unitAreaCount: number;
    lessonCount: number;
    unitAreas: UnitAreaDto[];
    pagingOption?: PaginationOptionsDto;
}

export class PagedUnitResponseDto {
    data: UnitResponseDto[];
    totalItems: number;
    totalPages: number;
    currentPage: number;
}
