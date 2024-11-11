import { ApiProperty } from '@nestjs/swagger';
import { Skill } from 'src/database/entities/skill.entity';

export class SkillsSummaryDto {
    @ApiProperty()
    skillId: string;

    @ApiProperty()
    skillName: string;

    @ApiProperty()
    correctAnswers: number;

    @ApiProperty()
    totalQuestions: number;

    @ApiProperty()
    accuracy: number;
}

export class SkillDetailsDto {
    @ApiProperty()
    skillId: string;

    @ApiProperty()
    skillName: string;

    @ApiProperty()
    accuracy: number;

    @ApiProperty()
    proficiencyLevel: string;
}

export class RecommendedUnitDto {
    @ApiProperty()
    unitAreaId: string;

    @ApiProperty()
    unitAreaTitle: string;

    @ApiProperty()
    skillId: string;

    @ApiProperty()
    skillName: string;
}


export class ProgressEvaluationDto {
    @ApiProperty()
    comparison: string;  // e.g., "Improvement", "Same", "Decline"

    @ApiProperty()
    previousScore: number;

    @ApiProperty()
    currentScore: number;
}

export class CompleteQuizAttemptResponseDto {
    @ApiProperty()
    currentScore: number;

    @ApiProperty()
    courseMastery: number;

    @ApiProperty()
    currentUnit: string;

    @ApiProperty({ type: [SkillsSummaryDto] })
    skillsSummary: SkillsSummaryDto[];

    @ApiProperty({ type: [SkillDetailsDto] })
    skillDetails: SkillDetailsDto[];

    @ApiProperty({ type: [Skill] })
    recommendedLessons: Skill[];

    @ApiProperty({
        type: 'object',
        example: { progress: 'improved', previousScore: 85 }
    })
    progressEvaluation: {
        progress: string;
        previousScore: number;
    };
}


