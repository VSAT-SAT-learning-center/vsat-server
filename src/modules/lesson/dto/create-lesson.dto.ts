import { ApiProperty } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
    IsBoolean,
    IsEnum,
    IsNotEmpty,
    IsOptional,
    IsString,
    IsUUID,
    ValidateNested,
} from 'class-validator';
import { LessonType } from 'src/common/enums/lesson-type.enum';
import { CreateLessonContentDto } from 'src/modules/lesson-content/dto/create-lessoncontent.dto';

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

    @ApiProperty({
        enum: LessonType,
        enumName: 'LessonType',
        example: LessonType.TEXT,
        default: LessonType.TEXT,
        required: false,
    })
    @IsEnum(LessonType)
    @IsOptional()
    @Transform(({ value }) => value ?? LessonType.TEXT)
    type?: LessonType;

    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    title: string;

    @ApiProperty()
    @IsBoolean()
    @IsOptional()
    status?: boolean;

    @ApiProperty({
        type: [CreateLessonContentDto],
        description: 'Array of lesson contents',
        required: false,
    })
    @IsOptional()
    @ValidateNested({ each: true })
    @Type(() => CreateLessonContentDto)
    lessonContents?: CreateLessonContentDto[];
}
