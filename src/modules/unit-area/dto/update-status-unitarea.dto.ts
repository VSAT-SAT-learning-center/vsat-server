import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean } from 'class-validator';

export class UpdateUnitAreaStatusDto {
  @ApiProperty()
  @IsBoolean()
  status: boolean;
}