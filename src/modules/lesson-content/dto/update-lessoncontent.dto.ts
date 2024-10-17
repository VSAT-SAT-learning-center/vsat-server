import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsUUID, IsOptional, IsInt, IsBoolean, IsEnum } from 'class-validator';

export class UpdateLessonContentDto {
  @ApiProperty()
  @IsUUID()
  @IsOptional()
  lessonId?: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  title?: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  image?: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  url?: string;

  @ApiProperty()
  @IsInt()
  @IsOptional()
  sort?: number;

  @ApiProperty()
  @IsBoolean()
  @IsOptional()
  status?: boolean;

  @ApiProperty({ enum: ['Definition', 'Conceptual', 'Application', 'Tips & Tricks', 'Practice'] })
  @IsEnum(['Definition', 'Conceptual', 'Application', 'Tips & Tricks', 'Practice'])
  contenttype: 'Definition' | 'Conceptual' | 'Application' | 'Tips & Tricks' | 'Practice';
}
