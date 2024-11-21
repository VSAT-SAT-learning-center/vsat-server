import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CompleteLessonProgressDto {
    @ApiProperty({ example: '2d417dd0-c41b-4279-9f90-e19627eaef29' })
    @IsString()
    @IsNotEmpty()
    targetLearningDetailsId: string;
}
