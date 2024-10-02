import { IsUUID, IsBoolean } from 'class-validator';

export class CreateQuizAttemptAnswerDto {
  @IsUUID()
  quizAttemptId: string;

  @IsUUID()
  quizQuestionId: string;

  @IsBoolean()
  isCorrect: boolean;
}
