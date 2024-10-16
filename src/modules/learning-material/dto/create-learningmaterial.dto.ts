import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsBoolean, IsNotEmpty, IsOptional, IsString, IsUUID, ValidateNested } from "class-validator";
import { CreateLessonDto } from "./create-lesson.dto";

export class CreateLearningMaterialDto {
    @ApiProperty({
      example: '0ecf1ec5-bf42-4c51-8e74-3546f2cfd91f',
    })
    @IsUUID()
    @IsNotEmpty()
    unitId: string;
  
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