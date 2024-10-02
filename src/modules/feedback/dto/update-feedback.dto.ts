import { IsUUID, IsString, IsOptional } from 'class-validator';

export class UpdateFeedbackDto {
  @IsUUID()
  @IsOptional()
  unitId?: string;

  @IsUUID()
  @IsOptional()
  examId?: string;

  @IsUUID()
  @IsOptional()
  questionId?: string;

  @IsUUID()
  @IsOptional()
  accountId?: string;

  @IsString()
  @IsOptional()
  content?: string;
}
