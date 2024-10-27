import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CompleteLessonProgressDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  targetLearningId: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  unitId: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  unitAreaId: string;

}
