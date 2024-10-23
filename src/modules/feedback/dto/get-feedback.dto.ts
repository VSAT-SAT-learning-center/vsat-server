import { ApiProperty } from '@nestjs/swagger'; // Importing the ApiProperty decorator
import { FeedbackReason } from 'src/common/enums/feedback-reason.enum';
import { FeedbackStatus } from 'src/common/enums/feedback-status.enum'; // Ensure the path is correct
import { UnitStatus } from 'src/common/enums/unit-status.enum';


export class LessonFeedbackDto {
    @ApiProperty({ example: '0ecf1ec5-bf42-4c51-8e74-3546f2cfd91f' })
    lessonId: string;

    @ApiProperty()
    isRejected: boolean;

    @ApiProperty({ example: 'The content of the feedback for the lesson' })
    content: string;

    @ApiProperty({ enum: FeedbackReason, example: FeedbackReason.COMPLEX_EXPLANATION })
    reason: FeedbackReason;
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

    @ApiProperty({ type: [UnitAreaFeedbackDto] })
    unitAreasFeedback: UnitAreaFeedbackDto[];
}


export class FeedbackDto {
    @ApiProperty({ type: UnitFeedbackDto })
    unitFeedback: UnitFeedbackDto;
}
