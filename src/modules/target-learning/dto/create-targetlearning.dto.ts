import { IsUUID, IsBoolean, IsOptional } from 'class-validator';

export class CreateTargetLearningDto {
  @IsUUID()
  levelId: string;

  @IsUUID()
  sectionId: string;

  @IsUUID()
  studyProfileId: string;
}
