import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsString, IsUUID, IsOptional, IsBoolean, ValidateNested, IsEnum } from 'class-validator';
import { CreateLessonContentDto } from 'src/modules/lesson-content/dto/create-lessoncontent.dto';

export class UpdateLessonDto {
    @ApiProperty()
    @IsUUID()
    @IsOptional()
    lessonId?: string;

    @ApiProperty()
    @IsUUID()
    @IsOptional()
    unitAreaId?: string;

    @ApiProperty()
    @IsUUID()
    @IsOptional()
    prerequisiteLessonId?: string;

    @ApiProperty({ enum: ['Text', 'Math', 'Quiz'] })
    @IsEnum(['Text', 'Math', 'Quiz'])
    type: 'Text'|  'Math' | 'Quiz';

    @ApiProperty()
    @IsString()
    @IsOptional()
    title?: string;

    @ApiProperty()
    @IsBoolean()
    @IsOptional()
    status?: boolean;

    @ValidateNested({ each: true })
    @Type(() => CreateLessonContentDto)
    lessonContent: CreateLessonContentDto[];
}
