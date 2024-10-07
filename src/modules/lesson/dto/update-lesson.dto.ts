import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsUUID, IsOptional, IsBoolean } from 'class-validator';

export class UpdateLessonDto {
  @ApiProperty()
  @IsUUID()
  @IsOptional()
  unitAreaId?: string;

  @ApiProperty()
  @IsUUID()
  @IsOptional()
  prerequisiteLessonId?: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  title?: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  content?: string;

  @ApiProperty()
  @IsBoolean()
  @IsOptional()
  status?: boolean;
}