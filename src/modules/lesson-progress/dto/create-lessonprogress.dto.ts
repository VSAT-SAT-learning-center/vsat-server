import { IsUUID, IsInt, IsOptional, IsString } from 'class-validator';

export class CreateLessonProgressDto {
  @IsUUID()
  unitAreaProgressId: string;

  @IsUUID()
  lessonId: string;

  @IsInt()
  @IsOptional()
  progress?: number;

  @IsString()
  @IsOptional()
  status?: string;
}
