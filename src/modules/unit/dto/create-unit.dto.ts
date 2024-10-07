import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsUUID, IsNotEmpty, IsOptional, IsBoolean } from 'class-validator';

export class CreateUnitDto {
  @ApiProperty({
    description: 'Section ID of the unit',
    example: '2f51716d-ca78-4536-addc-99fe09442a4d',
  })
  @IsUUID()
  @IsNotEmpty()
  sectionId: string;

  @ApiProperty({
    example: 'fe93459a-1c3f-4723-9e6f-4336425cd3b0',
  })
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
