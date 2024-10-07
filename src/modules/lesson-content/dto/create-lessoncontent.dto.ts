import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsUUID, IsOptional, IsNotEmpty, IsInt, IsBoolean } from 'class-validator';

export class CreateLessonContentDto {
  @ApiProperty({
    example: '45dc7a26-e7a0-414e-b7fb-1b30d255cecf',
  })
  @IsUUID()
  @IsNotEmpty()
  lessonId: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  title: string;

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
}
