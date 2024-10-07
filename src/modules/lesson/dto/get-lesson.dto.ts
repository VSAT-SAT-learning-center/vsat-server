import { Expose } from 'class-transformer';

export class GetLessonDTO {
    @Expose()
    id: string;

    @Expose()
    title: string;

    @Expose()
    context: string;
}
