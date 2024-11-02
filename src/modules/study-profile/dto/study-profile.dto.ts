import { IsUUID, IsInt, IsOptional, IsDateString, IsString } from 'class-validator';

export class StudyProfileDto {
  @IsInt()
  targetScoreMath?: number;

  @IsInt()
  targetScoreRW?: number;
}
