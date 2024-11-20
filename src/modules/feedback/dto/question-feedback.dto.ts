import { ApiProperty } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';

export class QuestionFeedbackDto {
    @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
    @IsOptional()
    feedbackId?: string;

    @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
    questionId: string;

    @ApiProperty({
        example:
            'The question is well structured but needs a clearer explanation.',
    })
    content: string;

    @IsOptional()
    reason?: string;

    @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
    accountFromId: string;

    @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
    accountToId?: string;
}
