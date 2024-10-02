import { IsUUID, IsOptional, IsInt } from 'class-validator';

export class CreateQuizAttemptDto {
  @IsUUID()
  studyProfileId: string;

  @IsUUID()
  quizId: string;

  @IsOptional()
  attemptdatetime?: Date;

  @IsInt()
  @IsOptional()
  score?: number;
}
