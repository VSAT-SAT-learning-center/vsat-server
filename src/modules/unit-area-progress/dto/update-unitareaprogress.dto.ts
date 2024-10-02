import { IsUUID, IsInt, IsOptional, IsString } from 'class-validator';

export class UpdateUnitAreaProgressDto {
  @IsUUID()
  @IsOptional()
  unitAreaId?: string;

  @IsUUID()
  @IsOptional()
  unitProgressId?: string;

  @IsInt()
  @IsOptional()
  progress?: number;

  @IsString()
  @IsOptional()
  status?: string;
}
