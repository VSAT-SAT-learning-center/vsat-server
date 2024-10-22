import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { IsString } from 'class-validator';

export class CheckExamAttemptDetail {
    @Expose()
    @ApiProperty()
    @IsString()
    examattemptid: string;

    @Expose()
    @ApiProperty()
    @IsString()
    questionid: string;

    @Expose()
    @ApiProperty()
    @IsString()
    studentanswer: string;

    isCorrect: boolean;
}
