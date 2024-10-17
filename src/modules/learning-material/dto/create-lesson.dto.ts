import { ApiProperty } from '@nestjs/swagger';
import {
    IsString,
    IsUUID,
    IsNotEmpty,
    IsOptional,
    IsBoolean,
    IsEnum,
} from 'class-validator';

export class CreateLessonDto {
   
    @ApiProperty({ enum: ['Text', 'Math', 'Quiz'] })
    @IsEnum(['Text', 'Math', 'Quiz'])
    type: 'Text'|  'Math' | 'Quiz';

    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    title: string;
}
