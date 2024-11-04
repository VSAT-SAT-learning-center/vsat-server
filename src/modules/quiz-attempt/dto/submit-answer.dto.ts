import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class SubmitAnswerDto {
    @ApiProperty()
    @IsString()
    quizQuestionId: string;

    @ApiProperty()
    @IsString()
    selectedAnswerId: string;

    @ApiProperty()
    @IsString()
    isCorrect: boolean;
}
