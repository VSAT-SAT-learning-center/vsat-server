import { Expose } from 'class-transformer';

export class GetLessonDTO {
    @Expose()
    id: string;

    @Expose()
    title: string;

    @Expose()
    context: string;
}

export class LessonContentDto {
    id: string;
    title: string;
    contentType: string;
    contents: ContentDto[];
    question: QuestionDto[] | null;
}

export class ContentDto {
    text: string;
    examples: ExampleDto[];
}

export class ExampleDto {
    content: string;
    explain: string;
    exampleId: string;
}

export class QuestionDto {
    prompt: string;
    correctAnswer: string;
    explanation?: string;
    answers: AnswerDto[];
    questionId: string;
}

export class AnswerDto {
    text: string;
    label: string;
    answerId: string;
}

export class LessonResponseDto {
    id: string;
    prerequisitelessonid: string | null;
    type: string;
    title: string;
    lessonContents: LessonContentDto[];
}
