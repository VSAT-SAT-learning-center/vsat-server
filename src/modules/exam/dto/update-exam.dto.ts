import { IsString, IsUUID, IsBoolean, IsOptional } from 'class-validator';

export class UpdateExamDto {
  @IsUUID()
  @IsOptional()
  examStructureId?: string;

  @IsUUID()
  @IsOptional()
  examTypeId?: string;

  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsBoolean()
  @IsOptional()
  status?: boolean;
}
