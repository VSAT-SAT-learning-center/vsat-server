import { IsString, IsUUID, IsNotEmpty, IsOptional, IsBoolean } from 'class-validator';

export class CreateLessonDto {
  @IsUUID()
  @IsNotEmpty()
  unitAreaId: string;

  @IsUUID()
  @IsOptional()
  prerequisiteLessonId?: string;

  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsOptional()
  content?: string;

  @IsBoolean()
  @IsOptional()
  status?: boolean;
}
