import { Expose } from 'class-transformer';

export class GetUnitDTO {
    @Expose()
    id: string;

    @Expose()
    title: string;

    @Expose()
    description: string;
}
