import { Expose } from 'class-transformer';

export class GetExamTypeDTO {
    @Expose()
    id: string;

    @Expose()
    name: string;

    @Expose()
    description: string;

    @Expose()
    status: boolean;
}
