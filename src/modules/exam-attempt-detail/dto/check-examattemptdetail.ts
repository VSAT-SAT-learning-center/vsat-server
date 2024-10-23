import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { IsString } from 'class-validator';

export class CheckExamAttemptDetail {
    @Expose()
    @ApiProperty({ example: '89404b38-e7b0-47c0-90f6-3be456cdfd56' })
    @IsString()
    examattemptid: string;

    @Expose()
    @ApiProperty({ example: '59a25d07-c07c-4d4a-85eb-fa731942671e' })
    @IsString()
    questionid: string;

    @Expose()
    @ApiProperty()
    @IsString()
    studentanswer: string;

    isCorrect: boolean;
}
