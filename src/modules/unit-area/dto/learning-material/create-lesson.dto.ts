import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
    IsString,
    IsUUID,
    IsNotEmpty,
    IsOptional,
    IsBoolean,
    IsEnum,
} from 'class-validator';
import { LessonType } from 'src/common/enums/lesson-type.enum';

export class CreateLessonDto {
   
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
}
