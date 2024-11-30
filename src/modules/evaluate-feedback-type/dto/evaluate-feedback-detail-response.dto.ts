import { Expose, Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { AccountDto } from 'src/common/dto/common.dto';

export class FeedbackCriteriaScoreDto {
    @ApiProperty({ description: 'Name of the evaluation criterion' })
    @Expose()
    name: string;

    @ApiProperty({ description: 'Description of the evaluation criterion' })
    @Expose()
    description: string;

    @ApiProperty({ description: 'Score for the evaluation criterion' })
    @Expose()
    score: number;
}

export class EvaluateFeedbackDetailResponseDto {
    @ApiProperty({ description: 'ID of the feedback' })
    @Expose()
    id: string;

    @ApiProperty({ description: 'Account that gave the feedback' })
    @Expose()
    @Type(() => AccountDto)
    accountFrom: AccountDto;

    @ApiProperty({ description: 'Account that received the feedback' })
    @Expose()
    @Type(() => AccountDto)
    accountTo: AccountDto;

    @ApiProperty({ description: 'Narrative feedback content' })
    @Expose()
    narrativeFeedback: string;

    @ApiProperty({ description: 'Indicates whether the feedback was escalated' })
    @Expose()
    isEscalated: boolean;

    @ApiProperty({
        description: 'List of criteria scores, sorted by name',
        type: [FeedbackCriteriaScoreDto],
    })
    @Expose()
    criteriaScores: FeedbackCriteriaScoreDto[];

    @ApiProperty({ description: 'Creation date of the feedback' })
    @Expose()
    createdat: Date;

    @ApiProperty({ description: 'Last update date of the feedback' })
    @Expose()
    updatedat: Date;
}
