import { ApiProperty } from '@nestjs/swagger';
import {
    IsBoolean,
    IsEnum,
    IsOptional,
    IsString,
    IsUUID,
    Length,
    ValidateNested,
} from 'class-validator';
import { FeedbackCriteriaScoreDto } from './feedback-criteria-score.dto';
import { Type } from 'class-transformer';

export class CreateEvaluateFeedbackDto {
    accountFromId: string;

    @ApiProperty({ description: 'ID of the account receiving the feedback.' })
    @IsOptional()
    accountToId: string;

    @ApiProperty({
        description: 'ID of the staff member reviewing the feedback.',
        required: false,
    })
    @IsOptional()
    accountReviewId?: string;

    @ApiProperty({
        description: 'ID of the student study profile for feedback.',
        required: false,
    })
    @IsOptional()
    studyProfileId?: string;

    @ApiProperty({ description: 'Narrative feedback.', required: false })
    @IsString()
    @IsOptional()
    narrativeFeedback?: string;

    @ApiProperty({
        description: 'Is feedback escalated to a staff member?',
        default: false,
    })
    @IsBoolean()
    @IsOptional()
    isEscalated?: boolean;

    @ApiProperty()
    @IsBoolean()
    @IsOptional()
    isSendToStaff?: boolean;

    @ApiProperty({
        description: 'Scores for criteria.',
        type: [FeedbackCriteriaScoreDto],
    })
    @ValidateNested({ each: true })
    @Type(() => FeedbackCriteriaScoreDto)
    criteriaScores: FeedbackCriteriaScoreDto[];
}
