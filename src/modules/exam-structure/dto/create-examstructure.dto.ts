import { IsString, IsUUID, IsOptional } from 'class-validator';

export class CreateExamStructureDto {
  @IsString()
  structurename: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsUUID()
  @IsOptional()
  createdby?: string;
}
