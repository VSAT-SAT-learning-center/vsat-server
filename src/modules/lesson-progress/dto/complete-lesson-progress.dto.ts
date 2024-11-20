import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CompleteLessonProgressDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  targetLearningDetailsId: string
}
