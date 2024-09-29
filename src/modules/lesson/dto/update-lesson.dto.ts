import { IsString, IsUUID, IsOptional, IsBoolean } from 'class-validator';

export class UpdateLessonDto {
  @IsUUID()
  @IsOptional()
  unitAreaId?: string;

  @IsUUID()
  @IsOptional()
  prerequisiteLessonId?: string;

  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  content?: string;

  @IsBoolean()
  @IsOptional()
  status?: boolean;
}