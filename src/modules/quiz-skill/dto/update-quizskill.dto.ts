import { IsUUID, IsOptional } from 'class-validator';

export class UpdateQuizSkillDto {
  @IsUUID()
  @IsOptional()
  quizId?: string;

  @IsUUID()
  @IsOptional()
  skillId?: string;
}
