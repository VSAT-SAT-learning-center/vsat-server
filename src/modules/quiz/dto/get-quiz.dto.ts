import { ApiProperty } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';

export class UnitDto {
    @Expose()
    id: string;

    @Expose()
    name: string;
}

export class GetQuizDto {
    @Expose()
    id: string;

    @Expose()
    totalquestion: number;

    @Expose()
    passingscore: number;

    @Expose()
    status: boolean;

    @Expose()
    @Type(() => UnitDto)
    unit: UnitDto;
}
