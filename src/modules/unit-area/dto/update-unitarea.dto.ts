import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsString, IsUUID, IsOptional, IsBoolean, ValidateNested } from 'class-validator';
import { UpdateLessonDto } from 'src/modules/lesson/dto/update-lesson.dto';

export class UpdateUnitAreaDto {
  @ApiProperty({
    example: '0ecf1ec5-bf42-4c51-8e74-3546f2cfd91f',
  })
  @IsUUID()
  unitId: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  title?: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty()
  @IsBoolean()
  @IsOptional()
  status?: boolean;

  @ApiProperty({
    type: [UpdateLessonDto], // Specify the correct type here
    description: 'List of lessons under the Unit Area',
  })
  @ValidateNested({ each: true })
  @Type(() => UpdateLessonDto)
  @IsOptional()
  lessons?: UpdateLessonDto[];
}