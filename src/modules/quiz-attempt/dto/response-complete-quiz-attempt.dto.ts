import { ApiProperty } from '@nestjs/swagger';
import { Skill } from 'src/database/entities/skill.entity';
import { CategorizedSkillDetailsDto } from './categoried-skill-details.dto';
import { UnitDto } from 'src/common/dto/common.dto';

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

    @ApiProperty({ required: false })
    previousAccuracy?: number;

    @ApiProperty({ required: false })
    improvement?: number;
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
    comparison: string; // e.g., "Improvement", "Same", "Decline"

    @ApiProperty()
    previousScore: number;

    @ApiProperty()
    currentScore: number;
}

export class CompleteQuizAttemptResponseDto {
    currentScore: number;

    courseMastery: number;

    currentUnit: UnitDto;

    skillsSummary: SkillsSummaryDto[];

    skillDetails: CategorizedSkillDetailsDto;

    recommendedLessons: any;

    progressEvaluation: {
        progress: string;
        previousScore: number;
    };

    correctAnswers: number;
    totalQuestions: number;
}
