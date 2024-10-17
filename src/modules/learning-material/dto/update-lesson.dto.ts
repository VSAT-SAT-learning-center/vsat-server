import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';

export class UpdateLessonDto {
    @ApiProperty({
        example: '0ecf1ec5-bf42-4c51-8e74-3546f2cfd91f',
        required: true,
    })
    @IsUUID()
    @IsNotEmpty()
    id: string;

    @ApiProperty({ enum: ['Text', 'Math', 'Quiz'] })
    @IsEnum(['Text', 'Math', 'Quiz'])
    type: 'Text' | 'Math' | 'Quiz';

    @ApiProperty({ required: false })
    @IsString()
    @IsOptional()
    title?: string;
}
