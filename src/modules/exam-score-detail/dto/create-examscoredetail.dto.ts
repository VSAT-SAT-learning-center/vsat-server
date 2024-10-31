import { ApiProperty } from '@nestjs/swagger';
import { IsUUID, IsInt, IsOptional, IsString } from 'class-validator';

export class CreateExamScoreDetailDto {
    @ApiProperty()
    @IsUUID()
    id: string;

    @IsString()
    @ApiProperty()
    section: string;

    @IsInt()
    @ApiProperty()
    rawscore?: number;

    @IsInt()
    @ApiProperty()
    lowerscore?: number;

    @IsInt()
    @ApiProperty()
    upperscore?: number;
}
