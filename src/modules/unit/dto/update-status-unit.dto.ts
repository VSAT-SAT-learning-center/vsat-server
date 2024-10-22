import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsString, IsUUID, IsOptional, IsEnum } from 'class-validator';
import { UnitStatus } from 'src/common/enums/unit-status.enum';

export class UpdateUnitStatusDto {

  @ApiProperty({
    enum: UnitStatus,
    enumName: 'UnitStatus',
    description: 'The status of the unit',
    example: UnitStatus.DRAFT,
    default: UnitStatus.DRAFT,
    required: false,
  })
  @IsEnum(UnitStatus)
  @Transform(({ value }) => value ?? UnitStatus.DRAFT)
  status: UnitStatus;
  
}
