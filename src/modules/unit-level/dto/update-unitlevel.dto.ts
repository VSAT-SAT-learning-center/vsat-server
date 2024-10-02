import { IsUUID, IsOptional } from 'class-validator';

export class UpdateUnitLevelDto {
  @IsUUID()
  @IsOptional()
  unitId?: string;

  @IsUUID()
  @IsOptional()
  levelId?: string;

  @IsUUID()
  @IsOptional()
  updatedby?: string;
}
