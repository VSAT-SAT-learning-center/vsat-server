import { IsUUID, IsOptional, IsString, IsInt, IsBoolean } from 'class-validator';

export class UpdateModuleTypeDto {
  @IsUUID()
  @IsOptional()
  sectionId?: string;

  @IsUUID()
  @IsOptional()
  examStructureId?: string;

  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  level?: string;

  @IsInt()
  @IsOptional()
  numberOfQuestion?: number;

  @IsBoolean()
  @IsOptional()
  status?: boolean;
}
