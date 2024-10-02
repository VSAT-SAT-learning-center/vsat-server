import { IsUUID, IsInt, IsOptional, IsString } from 'class-validator';

export class CreateUnitAreaProgressDto {
  @IsUUID()
  unitAreaId: string;

  @IsUUID()
  unitProgressId: string;

  @IsInt()
  @IsOptional()
  progress?: number;

  @IsString()
  @IsOptional()
  status?: string;
}
