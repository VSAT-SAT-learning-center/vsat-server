import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsString, IsUUID, IsNotEmpty, IsOptional, IsBoolean, ValidateNested } from 'class-validator';
import { CreateLessonDto } from 'src/modules/lesson/dto/create-lesson.dto';

export class CreateUnitAreaDto {
  @ApiProperty({
    example: '0ecf1ec5-bf42-4c51-8e74-3546f2cfd91f',
  })
  @IsUUID()
  @IsNotEmpty()
  unitId: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  name: string; 

  @ApiProperty()
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty()
  @IsBoolean()
  @IsOptional()
  status?: boolean;

  @ApiProperty({
    type: [CreateLessonDto], // Specify the correct type here
    description: 'List of lessons under the Unit Area',
  })
  @ValidateNested({ each: true })
  @Type(() => CreateLessonDto)
  @IsOptional()
  lessons?: CreateLessonDto[];
}
