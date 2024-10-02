import { IsUUID, IsString, IsOptional } from 'class-validator';

export class CreateFeedbackDto {
  @IsUUID()
  unitId: string;

  @IsUUID()
  examId: string;

  @IsUUID()
  questionId: string;

  @IsUUID()
  accountId: string;

  @IsString()
  @IsOptional()
  content?: string;
}
