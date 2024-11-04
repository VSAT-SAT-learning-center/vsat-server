import { ApiProperty } from '@nestjs/swagger';

export class SaveQuizAttemptProgressDto {
    @ApiProperty({
        description: 'The ID of the question being answered in the quiz attempt.',
        example: 'question-id-123',
    })
    questionId: string;

    @ApiProperty({
        description: 'The ID of the answer selected by the student for the given question.',
        example: 'answer-id-456',
    })
    selectedAnswerId: string;
}
