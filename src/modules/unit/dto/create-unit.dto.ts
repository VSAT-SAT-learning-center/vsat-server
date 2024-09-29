import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsUUID, IsNotEmpty, IsOptional, IsBoolean } from 'class-validator';

export class CreateUnitDto {
  @ApiProperty()
  @IsUUID()
  @IsNotEmpty()
  sectionId: string;

  @ApiProperty()
  @IsUUID()
  @IsOptional()
  levelId?: string;

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
}
