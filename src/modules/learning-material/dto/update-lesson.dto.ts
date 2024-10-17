import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsEnum, IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';
import { LessonType } from 'src/common/enums/lesson-type.enum';

export class UpdateLessonDto {
    @ApiProperty({
        example: '0ecf1ec5-bf42-4c51-8e74-3546f2cfd91f',
        required: true,
    })
    @IsUUID()
    @IsNotEmpty()
    id: string;

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

    @ApiProperty({ required: false })
    @IsString()
    @IsOptional()
    title?: string;
}
