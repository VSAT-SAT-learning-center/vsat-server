import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class StartLessonProgressDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  targetLearningDetailsId: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  unitId: string;
  
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  unitAreaId: string;
}
