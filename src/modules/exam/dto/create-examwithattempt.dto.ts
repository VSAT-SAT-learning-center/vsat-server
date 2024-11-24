import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { IsArray, IsUUID } from 'class-validator';

export class CreateExamWithExamAttemptDto {
    @ApiProperty()
    @Expose()
    examId: string;

    @ApiProperty()
    @Expose()
    attemptdatetime: Date;

    @ApiProperty({})
    @IsArray()
    @Expose()
    studyProfileIds: string[];
}
