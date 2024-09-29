import { IsString, IsUUID, IsOptional, IsNotEmpty, IsInt, IsBoolean } from 'class-validator';

export class CreateLessonContentDto {
  @IsUUID()
  @IsNotEmpty()
  lessonId: string;

  @IsString()
  @IsNotEmpty()
  title: string;

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
