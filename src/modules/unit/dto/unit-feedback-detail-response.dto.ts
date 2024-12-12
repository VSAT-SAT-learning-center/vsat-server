export class ContentDto {
    id: string;
    title: string;
    contentType: string;
    contents: Array<{
        contentId: string;
        text: string;
        examples: Array<{
            exampleId: string;
            content: string;
            explain: string;
        }>;
    }>;
    question: {
        questionId: string;
        prompt: string;
        correctAnswer: string;
        explanation: string;
        answers: Array<{
            answerId: string;
            text: string;
            label: string;
        }>;
    } | null;
}

export class LessonDto {
    id: string;
    prerequisitelessonid: string | null;
    type: string;
    title: string;
    status: boolean;
    reason: string[] | null;
    lessonContents: ContentDto[];
}

export class UnitAreaDto {
    id: string;
    title: string;
    lessons: LessonDto[];
}

export class SectionDto {
    id: string;
    name: string;
}

export class LevelDto {
    id: string;
    name: string;
}

export class DomainDto {
    id: string;
    name: string;
}

export class UnitFeedbackResponseDto {
    id: string;
    title: string;
    description: string;
    createdat: Date;
    status: string;
    unitAreas: UnitAreaDto[];
    section: SectionDto | null;
    level: LevelDto | null;
    domain: DomainDto | null;
    unitAreaCount: number;
    lessonCount: number;
}
export class PagedUnitFeedbackResponseDto {
    data: UnitFeedbackResponseDto[];
    totalItems: number;
    totalPages: number;
    currentPage: number;
}
