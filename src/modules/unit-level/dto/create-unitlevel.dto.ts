import { IsUUID, IsOptional } from 'class-validator';

export class CreateUnitLevelDto {
  @IsUUID()
  unitId: string;

  @IsUUID()
  levelId: string;

  @IsUUID()
  @IsOptional()
  createdby?: string;
}
