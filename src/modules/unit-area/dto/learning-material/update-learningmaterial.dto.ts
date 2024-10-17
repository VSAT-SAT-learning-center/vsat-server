import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsOptional, IsString, IsUUID, ValidateNested } from "class-validator";
import { UpdateLessonDto } from "./update-lesson.dto";

export class UpdateLearningMaterialDto {
  @ApiProperty({
    example: '0ecf1ec5-bf42-4c51-8e74-3546f2cfd91f',
    required: false,
  })
  @IsUUID()
  @IsOptional()
  unitId?: string; // Optional for update

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  title?: string; // Optional for update

  @ApiProperty({
    type: [UpdateLessonDto], // Specify the correct type here
    description: 'List of lessons under the Unit Area',
    required: false,
  })
  @ValidateNested({ each: true })
  @Type(() => UpdateLessonDto)
  @IsOptional()
  lessons?: UpdateLessonDto[]; // Optional lessons for update
}
