import { ApiProperty } from '@nestjs/swagger'; // Importing the ApiProperty decorator
import { IsOptional } from 'class-validator';
import { FeedbackReason } from 'src/common/enums/feedback-reason.enum';


export class LessonFeedbackDto {
    @ApiProperty({ example: '0ecf1ec5-bf42-4c51-8e74-3546f2cfd91f' })
    lessonId: string;

    @ApiProperty()
    isRejected: boolean;

    @ApiProperty({ example: 'The content of the feedback for the lesson' })
    content: string;

    @ApiProperty({ enum: FeedbackReason, example: FeedbackReason.COMPLEX_EXPLANATION })
    @IsOptional()
    reason?: FeedbackReason;
}

export class UnitAreaFeedbackDto {
    @ApiProperty({ example: '0ecf1ec5-bf42-4c51-8e74-3546f2cfd91f' })
    unitAreaId: string;

    @ApiProperty({ type: [LessonFeedbackDto] })
    lessonsFeedback: LessonFeedbackDto[];
}

export class UnitFeedbackDto {
    @ApiProperty({ example: '0ecf1ec5-bf42-4c51-8e74-3546f2cfd91f' })
    unitId: string;

    @ApiProperty({ type: [LessonFeedbackDto] })
    lessonsFeedback: LessonFeedbackDto[];
}


export class LearningMaterialFeedbackDto {
    @ApiProperty({ type: UnitFeedbackDto })
    unitFeedback: UnitFeedbackDto;

    @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
    accountFromId: string;

    @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
    accountToId?: string;
}
