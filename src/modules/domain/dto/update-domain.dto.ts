import { IsString, IsUUID, IsOptional } from 'class-validator';

export class UpdateDomainDto {
  @IsUUID()
  @IsOptional()
  sectionId?: string;

  @IsString()
  @IsOptional()
  content?: string;

  @IsOptional()
  status?: boolean;
}
