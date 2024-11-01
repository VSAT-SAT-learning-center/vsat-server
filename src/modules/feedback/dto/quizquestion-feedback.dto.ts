import { ApiProperty } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';
import { FeedbackReason } from 'src/common/enums/feedback-reason.enum';

export class QuizQuestionFeedbackDto {
    @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
    quizQuestionId: string;

    @ApiProperty({ example: 'The question is well structured but needs a clearer explanation.' })
    content: string;

    @ApiProperty({
        example: FeedbackReason.COMPLEX_EXPLANATION,
    })
    @IsOptional()
    reason?: string;

    @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
    accountFromId: string;

    @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
    accountToId?: string;
    
}
