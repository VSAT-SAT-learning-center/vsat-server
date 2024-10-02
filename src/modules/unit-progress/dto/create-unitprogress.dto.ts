import { IsUUID, IsInt, IsString, IsOptional } from 'class-validator';

export class CreateUnitProgressDto {
  @IsUUID()
  studyProfileId: string;

  @IsUUID()
  unitId: string;

  @IsInt()
  @IsOptional()
  progress?: number;

  @IsString()
  @IsOptional()
  status?: string;
}
