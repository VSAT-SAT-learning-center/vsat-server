import { IsUUID, IsInt, IsOptional } from 'class-validator';

export class CreateExamAttemptDto {
  @IsUUID()
  studyProfileId: string;

  @IsUUID()
  examId: string;

  @IsOptional()
  attemptdatetime: Date;

  @IsInt()
  @IsOptional()
  score?: number;
}
