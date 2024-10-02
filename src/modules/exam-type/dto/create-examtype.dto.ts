import { IsString, IsUUID, IsOptional, IsBoolean } from 'class-validator';

export class CreateExamTypeDto {
  @IsString()
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsBoolean()
  @IsOptional()
  status?: boolean;

  @IsUUID()
  @IsOptional()
  createdby?: string;
}
