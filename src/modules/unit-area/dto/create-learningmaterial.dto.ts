import { ApiProperty } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
    IsEnum,
    IsNotEmpty,
    IsOptional,
    IsString,
    IsUUID,
    ValidateNested,
} from 'class-validator';
import { LessonType } from 'src/common/enums/lesson-type.enum';
import { CreateLessonContentDto } from 'src/modules/lesson-content/dto/create-lessoncontent.dto';
import { CreateLessonDto } from 'src/modules/lesson/dto/create-lesson.dto';

// export class CreateLessonDto {
//     @ApiProperty({
//         example: '0ecf1ec5-bf42-4c51-8e74-3546f2cfd91f',
//     })
//     @IsOptional()
//     @IsString()
//     id: string;
    
//     @ApiProperty({
//         enum: LessonType,
//         enumName: 'LessonType',
//         example: LessonType.TEXT,
//         default: LessonType.TEXT,
//         required: false,
//     })
//     @IsEnum(LessonType)
//     @IsOptional()
//     @Transform(({ value }) => value ?? LessonType.TEXT)
//     type?: LessonType;

//     @ApiProperty()
//     @IsString()
//     @IsNotEmpty()
//     title: string;

//     @ApiProperty({
//         type: [CreateLessonContentDto],
//         description: 'Array of lesson contents',
//         required: false,
//     })
//     @IsOptional()
//     @ValidateNested({ each: true })
//     @Type(() => CreateLessonContentDto)
//     lessonContents?: CreateLessonContentDto[];
// }
export class CreateLearningMaterialDto {
    @ApiProperty({
        example: '0ecf1ec5-bf42-4c51-8e74-3546f2cfd91f',
    })
    @IsOptional()
    @IsUUID()
    id?: string;

    @ApiProperty({
        example: '0ecf1ec5-bf42-4c51-8e74-3546f2cfd91f',
    })
    @IsUUID()
    @IsNotEmpty()
    unitId: string;

    @ApiProperty({
        example: '0ecf1ec5-bf42-4c51-8e74-3546f2cfd91f',
    })
    @IsUUID()
    @IsNotEmpty()
    skillId: string;

    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    title: string;

    @ApiProperty({
        type: [CreateLessonDto], // Specify the correct type here
        description: 'List of lessons under the Unit Area',
    })
    @ValidateNested({ each: true })
    @Type(() => CreateLessonDto)
    @IsOptional()
    lessons?: CreateLessonDto[];
}
