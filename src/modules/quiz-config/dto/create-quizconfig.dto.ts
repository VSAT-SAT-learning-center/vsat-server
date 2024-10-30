import { IsUUID } from 'class-validator';

export class CreateQuizConfigDto {
  @IsUUID()
  quizId: string;

  @IsUUID()
  skillId: string;
}
