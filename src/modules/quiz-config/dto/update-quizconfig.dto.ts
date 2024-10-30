import { IsUUID, IsOptional } from 'class-validator';

export class UpdateQuizConfigDto {
  @IsUUID()
  @IsOptional()
  quizId?: string;

  @IsUUID()
  @IsOptional()
  skillId?: string;
}
