import { ApiProperty } from '@nestjs/swagger';
import { FeedbackReason } from 'src/common/enums/feedback-reason.enum';

export class QuestionFeedbackDto {
    @ApiProperty({
        description: 'ID of the question being approved or rejected',
        example: '123e4567-e89b-12d3-a456-426614174000',
    })
    questionId: string;

    @ApiProperty({
        description: 'Feedback content',
        example:
            'The question is well structured but needs a clearer explanation.',
    })
    content: string;

    @ApiProperty({
        enum: FeedbackReason,
        example: FeedbackReason.COMPLEX_EXPLANATION,
    })
    reason?: FeedbackReason;
}
