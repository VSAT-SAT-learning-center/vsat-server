import { ApiProperty } from '@nestjs/swagger'; // Importing the ApiProperty decorator
import { FeedbackStatus } from 'src/common/enums/feedback-status.enum'; // Ensure the path is correct
import { UnitStatus } from 'src/common/enums/unit-status.enum';


export class UnitFeedbackDto {
    @ApiProperty({ example: '0ecf1ec5-bf42-4c51-8e74-3546f2cfd91f' })
    unitId: string;

    @ApiProperty({ example: 'The content of the feedback' })
    content: string;

    @ApiProperty({ enum: UnitStatus, example: UnitStatus.REJECTED })
    status: UnitStatus;
}

export class UnitAreaFeedbackDto {
    @ApiProperty({ example: '0ecf1ec5-bf42-4c51-8e74-3546f2cfd91f' })
    unitAreaId: string;

    @ApiProperty()
    isApproved: boolean;

    @ApiProperty({ example: 'The content of the feedback for the unit area' })
    content: string;
}

export class LessonFeedbackDto {
    @ApiProperty({ example: '0ecf1ec5-bf42-4c51-8e74-3546f2cfd91f' })
    lessonId: string;

    @ApiProperty()
    isApproved: boolean;

    @ApiProperty({ example: 'The content of the feedback for the lesson' })
    content: string;
}

export class FeedbackDto {
    @ApiProperty({ type: UnitAreaFeedbackDto })
    unitFeedback: UnitFeedbackDto;

    @ApiProperty({ type: [UnitAreaFeedbackDto] })
    unitAreasFeedback: UnitAreaFeedbackDto[];

    @ApiProperty({ type: [LessonFeedbackDto] })
    lessonsFeedback: LessonFeedbackDto[];
}
