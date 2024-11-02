import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class GetExamScoreDto {
    @ApiProperty({ description: 'The name of the exam structure type' })
    @IsString()
    name: string;
}
