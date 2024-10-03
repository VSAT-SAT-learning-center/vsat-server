import { Expose } from 'class-transformer';

export class GetUnitDTO {
    @Expose()
    id: string;

    @Expose()
    name: string;

    @Expose()
    description: string;
}
