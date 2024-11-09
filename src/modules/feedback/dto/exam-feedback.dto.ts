import { ApiProperty } from '@nestjs/swagger'; // Importing the ApiProperty decorator
import { IsOptional } from 'class-validator';
import { FeedbackReason } from 'src/common/enums/feedback-reason.enum';

export class ModuleTypeFeedbackDto {
    @ApiProperty({ example: '0ecf1ec5-bf42-4c51-8e74-3546f2cfd91f' })
    moduleTypeId: string;

    @ApiProperty()
    isRejected: boolean;

    @ApiProperty({ example: 'The content of the feedback for the lesson' })
    content: string;

    @ApiProperty({ example: FeedbackReason.FORMATING_ISSUES })
    @IsOptional()
    reason?: string;
}

export class ExamFeedbackDto {
    @ApiProperty({ example: '0ecf1ec5-bf42-4c51-8e74-3546f2cfd91f' })
    examId: string;

    @ApiProperty({ type: [ModuleTypeFeedbackDto] })
    moduleTypesFeedback: ModuleTypeFeedbackDto[];
}

export class ExamCensorFeedbackDto {
    @ApiProperty({ type: ExamFeedbackDto })
    examFeedback: ExamFeedbackDto;

    @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
    accountFromId: string;

    @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
    accountToId?: string;
}
