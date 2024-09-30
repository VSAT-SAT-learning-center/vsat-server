import { IsUUID, IsOptional } from 'class-validator';

export class BaseDTO {
  @IsUUID()
  @IsOptional()
  createdby?: string; 

  @IsUUID()
  @IsOptional()
  updatedby?: string;
}
