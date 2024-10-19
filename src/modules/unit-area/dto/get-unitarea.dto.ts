export class LessonDto {
    id: string;
    prerequisitelessonid: string | null;
    type: string;
    title: string;
}

// export class UnitDto {
//     id: string;
// }

export class UnitAreaResponseDto {
    id: string;
    title: string;
    unitid: string; // Thay đổi để phản ánh unitid thay vì unit object
    lessons: LessonDto[];
}
