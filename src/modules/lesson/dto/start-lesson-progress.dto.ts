import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class StartLessonProgressDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  targetLearningId: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  unitAreaId: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  unitId: string;
}