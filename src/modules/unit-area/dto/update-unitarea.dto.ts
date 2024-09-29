import { IsString, IsUUID, IsOptional, IsBoolean } from 'class-validator';

export class UpdateUnitAreaDto {
  @IsUUID()
  @IsOptional()
  unitId?: string;

  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsBoolean()
  @IsOptional()
  status?: boolean;
}