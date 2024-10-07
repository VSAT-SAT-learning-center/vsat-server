import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsUUID, IsOptional, IsBoolean } from 'class-validator';

export class UpdateUnitDto {
  @ApiProperty()
  @IsUUID()
  @IsOptional()
  sectionId?: string;

  @ApiProperty()
  @IsUUID()
  @IsOptional()
  levelId?: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  name?: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty()
  @IsBoolean()
  @IsOptional()
  status?: boolean;
}
