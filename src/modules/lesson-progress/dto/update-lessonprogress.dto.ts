import { IsUUID, IsInt, IsOptional, IsString } from 'class-validator';

export class UpdateLessonProgressDto {
  @IsUUID()
  @IsOptional()
  unitAreaProgressId?: string;

  @IsUUID()
  @IsOptional()
  lessonId?: string;

  @IsInt()
  @IsOptional()
  progress?: number;

  @IsString()
  @IsOptional()
  status?: string;
}
