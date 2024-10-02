import { IsUUID, IsBoolean, IsOptional } from 'class-validator';

export class UpdateTargetLearningDto {
  @IsUUID()
  @IsOptional()
  levelId?: string;

  @IsUUID()
  @IsOptional()
  sectionId?: string;

  @IsUUID()
  @IsOptional()
  studyProfileId?: string;

  @IsBoolean()
  @IsOptional()
  status?: boolean;
}
