import { IsString, IsUUID, IsBoolean, IsOptional } from 'class-validator';

export class CreateExamDto {
  @IsUUID()
  examStructureId: string;

  @IsUUID()
  examTypeId: string;

  @IsString()
  title: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsBoolean()
  @IsOptional()
  status?: boolean;
}
