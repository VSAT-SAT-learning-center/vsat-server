import { ApiProperty } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';

export class SkillContentDto {

  @Expose()
  @ApiProperty({ example: 'Basic Algebra' })
  id: string;

  @Expose()
  @ApiProperty({ example: 'Basic Algebra' })
  content: string;
}

export class UnitWithSkillsDto {
  @Expose()
  @ApiProperty({ example: 'e73a1c8e-1b3d-4c5a-a22b-abc12345ef67' })
  id: string;

  @Expose()
  @Type(() => SkillContentDto)
  @ApiProperty({ type: [SkillContentDto], description: 'List of skill titles associated with the domain of the unit' })
  skills: SkillContentDto[];
}
