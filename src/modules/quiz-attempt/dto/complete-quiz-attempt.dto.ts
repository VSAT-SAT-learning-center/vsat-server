import { ApiProperty } from '@nestjs/swagger';

export class CompleteQuizAttemptDto {
    @ApiProperty({ description: 'ID của hồ sơ học tập của học sinh', example: 'studyProfileId' })
    unitProgressId: string;
}
