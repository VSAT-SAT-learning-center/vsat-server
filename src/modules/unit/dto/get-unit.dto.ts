import { Expose } from 'class-transformer';
import { ContentType } from 'src/common/enums/content-type.enum';
import { LessonType } from 'src/common/enums/lesson-type.enum';

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

export class UnitAreaDto {
    id: string;
    title: string;
    lessons: LessonDto[];
}

export class UnitResponseDto {
    id: string;
    title: string;
    description: string;
    unitAreas: UnitAreaDto[];
}
