import { ApiProperty } from '@nestjs/swagger';

export class SkipQuizAttemptProgressDto {
    @ApiProperty({
        description: 'The ID of the question being answered in the quiz attempt.',
        example: 'question-id-123',
    })
    questionId: string;
}
