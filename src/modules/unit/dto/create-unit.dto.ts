import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsString, IsUUID, IsNotEmpty, IsOptional, IsEnum } from 'class-validator';
import { UnitStatus } from 'src/common/enums/unit-status.enum';
import { BaseEntity } from 'typeorm';

export class CreateUnitDto extends BaseEntity {
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
  title: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({
    enum: UnitStatus,
    enumName: 'UnitStatus',
    description: 'The status of the unit',
    example: UnitStatus.DRAFT,
    default: UnitStatus.DRAFT,
    required: false,
  })
  @IsEnum(UnitStatus)
  @IsOptional()
  @Transform(({ value }) => value ?? UnitStatus.DRAFT)
  status?: UnitStatus;
}
