import { IsUUID, IsInt, IsString, IsOptional } from 'class-validator';

export class UpdateUnitProgressDto {
  @IsUUID()
  @IsOptional()
  studyProfileId?: string;

  @IsUUID()
  @IsOptional()
  unitId?: string;

  @IsInt()
  @IsOptional()
  progress?: number;

  @IsString()
  @IsOptional()
  status?: string;
}
