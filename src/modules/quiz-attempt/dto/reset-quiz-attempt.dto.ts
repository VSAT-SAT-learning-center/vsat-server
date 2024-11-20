import { ApiProperty } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';

export class ResetQuizAttemptProgressDto {
    @ApiProperty()
    @IsOptional()
    quizAttemptId: string;

    @ApiProperty()
    unitId: string;

    @ApiProperty()
    unitProgressId: string;
}
