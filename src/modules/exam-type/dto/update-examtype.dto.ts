import { IsString, IsUUID, IsOptional, IsBoolean } from 'class-validator';

export class UpdateExamTypeDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsBoolean()
  @IsOptional()
  status?: boolean;

  @IsUUID()
  @IsOptional()
  updatedby?: string;
}
