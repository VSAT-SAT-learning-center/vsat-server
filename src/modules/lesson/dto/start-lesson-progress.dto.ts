import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class StartLessonProgressDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  targetLearningDetailsId: string;
}
