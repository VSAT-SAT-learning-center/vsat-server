import { ApiProperty } from '@nestjs/swagger';

export class SkillDto {
  @ApiProperty({ example: '0ecf1ec5-bf42-4c51-8e74-3546f2cfd91f' })
  id: string;

  @ApiProperty({ example: 'This is the content of the skill' })
  content: string;
}
