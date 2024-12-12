import { ApiProperty } from "@nestjs/swagger";
import { Transform, Type } from "class-transformer";
import { IsEnum, IsNotEmpty, IsOptional, IsString, IsUUID, ValidateNested } from "class-validator";
import { LessonType } from "src/common/enums/lesson-type.enum";

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

export class UpdateLearningMaterialDto {
  @ApiProperty({
    example: '0ecf1ec5-bf42-4c51-8e74-3546f2cfd91f',
    required: false,
  })
  @IsUUID()
  @IsOptional()
  unitId?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  title?: string; 

  @ApiProperty({
    type: [UpdateLessonDto], 
    description: 'List of lessons under the Unit Area',
    required: false,
  })
  @ValidateNested({ each: true })
  @Type(() => UpdateLessonDto)
  @IsOptional()
  lessons?: UpdateLessonDto[];
}
