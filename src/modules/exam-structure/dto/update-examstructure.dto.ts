import { IsString, IsUUID, IsOptional } from 'class-validator';

export class UpdateExamStructureDto {
  @IsString()
  @IsOptional()
  structurename?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsUUID()
  @IsOptional()
  updatedby?: string;
}
