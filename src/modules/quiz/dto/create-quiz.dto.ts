import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import {
    IsUUID,
    IsOptional,
    IsInt,
    IsBoolean,
    IsNotEmpty,
} from 'class-validator';

export class CreateQuizDto {
    @ApiProperty({
        description: 'ID of the lesson',
        example: '0ecf1ec5-bf42-4c51-8e74-3546f2cfd91f',
    })
    @IsUUID()
    @IsNotEmpty()
    @Expose()
    unitId: string;

    @ApiProperty()
    @IsInt()
    @IsOptional()
    @Expose()
    totalquestion?: number;

    @ApiProperty()
    @IsInt()
    @IsOptional()
    @Expose()
    passingscore?: number;
}
