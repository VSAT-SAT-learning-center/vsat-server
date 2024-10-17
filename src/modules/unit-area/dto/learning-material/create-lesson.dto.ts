import { ApiProperty } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
    IsString,
    IsUUID,
    IsNotEmpty,
    IsOptional,
    IsBoolean,
    IsEnum,
    ValidateNested,
} from 'class-validator';
import { LessonType } from 'src/common/enums/lesson-type.enum';
import { CreateLessonContentDto } from 'src/modules/lesson-content/dto/create-lessoncontent.dto';

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
