import { IsUUID, IsOptional, IsString, IsInt, IsBoolean } from 'class-validator';

export class CreateModuleTypeDto {
  @IsUUID()
  sectionId: string;

  @IsUUID()
  examStructureId: string;

  @IsString()
  name: string;

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
