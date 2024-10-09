import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsUUID, IsNotEmpty, IsOptional, IsBoolean } from 'class-validator';

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
}
