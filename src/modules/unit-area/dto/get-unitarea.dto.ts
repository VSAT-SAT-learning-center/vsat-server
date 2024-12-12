export class LessonDto {
    id: string;
    prerequisitelessonid: string | null;
    type: string;
    title: string;
}

export class UnitAreaResponseDto {
    id: string;
    title: string;
    unitid: string;
    lessons: LessonDto[];
}
