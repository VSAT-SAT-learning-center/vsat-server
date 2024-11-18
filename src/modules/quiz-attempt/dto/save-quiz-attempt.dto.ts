import { ApiProperty } from '@nestjs/swagger';

export class SaveQuizAttemptProgressDto {
    @ApiProperty({
        description: 'The ID of the question being answered in the quiz attempt.',
        example: 'question-id-123',
    })
    questionId: string;

    @ApiProperty({
        example: 'answer-id-456',
    })
    studentdAnswerId: string;

    @ApiProperty({
        example: 'answer-id-456',
    })
    studentdAnswerText: string;
}
