import { IsUUID, IsOptional, IsInt } from 'class-validator';

export class UpdateQuizAttemptDto {
  @IsUUID()
  @IsOptional()
  studyProfileId?: string;

  @IsUUID()
  @IsOptional()
  quizId?: string;

  @IsOptional()
  attemptdatetime?: Date;

  @IsInt()
  @IsOptional()
  score?: number;
}
