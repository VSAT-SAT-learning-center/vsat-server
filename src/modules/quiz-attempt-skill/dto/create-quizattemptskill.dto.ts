import { IsUUID } from 'class-validator';

export class CreateQuizAttemptSkillDto {
  @IsUUID()
  quizAttemptId: string;

  @IsUUID()
  skillId: string;
}
