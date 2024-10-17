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
    @ApiProperty({
        example: '763e9e17-350e-4d84-bba3-1eab8c4326fa',
    })
    @IsUUID()
    @IsNotEmpty()
    unitAreaId: string;

    @ApiProperty()
    @IsUUID()
    @IsOptional()
    prerequisiteLessonId?: string;

    @ApiProperty({ enum: ['Text', 'Math', 'Quiz'] })
    @IsEnum(['Text', 'Math', 'Quiz'])
    type: 'Text'|  'Math' | 'Quiz';

    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    title: string;

    @ApiProperty()
    @IsBoolean()
    @IsOptional()
    status?: boolean;
}
