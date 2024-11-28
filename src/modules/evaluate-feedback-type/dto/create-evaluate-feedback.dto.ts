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

    @ApiProperty({ description: 'ID of the account providing the feedback.' })
    @IsUUID()
    accountFromId: string;

    @ApiProperty({ description: 'ID of the account receiving the feedback.' })
    @IsUUID()
    accountToId: string;

    @ApiProperty({ description: 'ID of the staff member reviewing the feedback.', required: false })
    @IsUUID()
    @IsOptional()
    accountReviewId?: string;

    @ApiProperty({ description: 'Narrative feedback.', required: false })
    @IsString()
    @IsOptional()
    narrativeFeedback?: string;

    @ApiProperty({ description: 'Is feedback escalated to a staff member?', default: false })
    @IsBoolean()
    @IsOptional()
    isEscalated?: boolean;

    @ApiProperty({ description: 'Scores for criteria.', type: [FeedbackCriteriaScoreDto] })
    @ValidateNested({ each: true })
    @Type(() => FeedbackCriteriaScoreDto)
    criteriaScores: FeedbackCriteriaScoreDto[];
}

