import { ApiProperty } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import { IsString, IsUUID, IsOptional, IsBoolean, ValidateNested, IsEnum } from 'class-validator';
import { LessonType } from 'src/common/enums/lesson-type.enum';
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
