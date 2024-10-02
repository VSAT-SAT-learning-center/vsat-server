import { IsUUID, IsInt, IsOptional } from 'class-validator';

export class UpdateExamAttemptDto {
  @IsUUID()
  @IsOptional()
  studyProfileId?: string;

  @IsUUID()
  @IsOptional()
  examId?: string;

  @IsOptional()
  attemptdatetime?: Date;

  @IsInt()
  @IsOptional()
  score?: number;
}
