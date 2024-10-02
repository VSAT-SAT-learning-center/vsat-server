import { IsUUID, IsOptional } from 'class-validator';

export class UpdateQuizAttemptSkillDto {
  @IsUUID()
  @IsOptional()
  quizAttemptId?: string;

  @IsUUID()
  @IsOptional()
  skillId?: string;
}
