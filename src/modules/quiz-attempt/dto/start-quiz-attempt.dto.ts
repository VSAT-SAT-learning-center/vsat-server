import { ApiProperty } from '@nestjs/swagger';

export class StartQuizAttemptDto {
    @ApiProperty({
        description: 'The ID of the student\'s study profile initiating the quiz attempt.',
        example: 'study-profile-id-123',
    })
    studyProfileId: string;

    @ApiProperty({
        description: 'The ID of the quiz that the student is attempting.',
        example: 'quiz-id-456',
    })
    quizId: string;
}
