import { IsUUID, IsBoolean, IsOptional } from 'class-validator';

export class UpdateExamAttemptDetailDto {
  @IsUUID()
  @IsOptional()
  examAttemptId?: string;

  @IsUUID()
  @IsOptional()
  questionId?: string;

  @IsBoolean()
  @IsOptional()
  iscorrect?: boolean;
}
