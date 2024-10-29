import { ApiProperty } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';
import { FeedbackReason } from 'src/common/enums/feedback-reason.enum';

export class QuestionFeedbackDto {
    @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
    questionId: string;

    @ApiProperty({ example: 'The question is well structured but needs a clearer explanation.' })
    content: string;

    @ApiProperty({
        enum: FeedbackReason,
        example: FeedbackReason.COMPLEX_EXPLANATION,
    })
    
    @IsOptional()
    reason?: FeedbackReason;

    @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
    accountFromId: string;

    @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
    accountToId?: string;
    
}
