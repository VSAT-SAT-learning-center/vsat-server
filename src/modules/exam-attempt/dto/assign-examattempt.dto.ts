import { ApiProperty } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';

export class AssignExamAttemptDto {
    @ApiProperty()
    @Expose()
    examId: string;

    @ApiProperty()
    @Expose()
    studyProfileId: string;

    @ApiProperty()
    @Expose()
    attempDate: Date;
}
