import { ApiProperty } from '@nestjs/swagger';
import { IsUUID, IsInt, IsOptional } from 'class-validator';

export class CreateExamScoreDetailDto {
    @IsUUID()
    @ApiProperty({ example: 'a4fdf022-b87a-4c52-b3f6-472132c2e432' })
    examScoreId: string;

    @IsUUID()
    @ApiProperty({ example: '3f5a66a5-d6ad-4a27-8b11-0ca120edaa8f' })
    sectionId: string;

    @IsInt()
    @IsOptional()
    @ApiProperty()
    rawscore?: number;

    @IsInt()
    @IsOptional()
    @ApiProperty()
    lowerscore?: number;

    @IsInt()
    @IsOptional()
    @ApiProperty()
    upperscore?: number;
}
