import { IsString, IsUUID, IsNotEmpty, IsOptional, IsBoolean } from 'class-validator';

export class CreateUnitAreaDto {
  @IsUUID()
  @IsNotEmpty()
  unitId: string;
  @IsString()
  @IsNotEmpty()
  name: string; 

  @IsString()
  @IsOptional()
  description?: string;

  @IsBoolean()
  @IsOptional()
  status?: boolean;
}
