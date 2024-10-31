import { Expose } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { IsUUID, IsInt, IsOptional, IsString } from 'class-validator';

export class UpdateExamScoreDetailDto {
    @IsUUID()
    @Expose()
    @ApiProperty()
    id: string;

    @IsInt()
    @ApiProperty()
    @Expose()
    lowerscore?: number;

    @IsInt()
    @ApiProperty()
    @Expose()
    upperscore?: number;

    @IsString()
    @ApiProperty()
    section: string;
}
