import { IsUUID, IsOptional, IsBoolean } from 'class-validator';

export class UpdateQuizAttemptAnswerDto {
  @IsUUID()
  @IsOptional()
  quizAttemptId?: string;

  @IsUUID()
  @IsOptional()
  quizQuestionId?: string;

  @IsBoolean()
  @IsOptional()
  isCorrect?: boolean;
}
