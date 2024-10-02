import { IsUUID, IsBoolean } from 'class-validator';

export class CreateExamAttemptDetailDto {
  @IsUUID()
  examAttemptId: string;

  @IsUUID()
  questionId: string;

  @IsBoolean()
  iscorrect: boolean;
}
