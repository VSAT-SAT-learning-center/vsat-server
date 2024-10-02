import { IsUUID } from 'class-validator';

export class CreateQuizSkillDto {
  @IsUUID()
  quizId: string;

  @IsUUID()
  skillId: string;
}
