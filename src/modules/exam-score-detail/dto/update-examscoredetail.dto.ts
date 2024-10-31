import { ApiProperty } from '@nestjs/swagger';
import { IsUUID, IsInt, IsOptional, IsString } from 'class-validator';

export class UpdateExamScoreDetailDto {
    @IsInt()
    @ApiProperty()
    lowerscore?: number;

    @IsInt()
    @ApiProperty()
    upperscore?: number;
}
