import { IsString, IsUUID, IsOptional, IsInt, IsBoolean } from 'class-validator';

export class UpdateLessonContentDto {
  @IsUUID()
  @IsOptional()
  lessonId?: string;

  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  image?: string;

  @IsString()
  @IsOptional()
  url?: string;

  @IsInt()
  @IsOptional()
  sort?: number;

  @IsBoolean()
  @IsOptional()
  status?: boolean;
}
