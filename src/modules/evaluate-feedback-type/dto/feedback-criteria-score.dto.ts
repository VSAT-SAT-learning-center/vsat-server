import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsUUID, Max, Min } from 'class-validator';

export class FeedbackCriteriaScoreDto {
    @ApiProperty({ description: 'ID of the criterion being scored.' })
    @IsUUID()
    criteriaId: string;

    @ApiProperty({ description: 'Score for the criterion (1-5).' })
    @IsNumber()
    @Min(1)
    @Max(5)
    score: number;
}
