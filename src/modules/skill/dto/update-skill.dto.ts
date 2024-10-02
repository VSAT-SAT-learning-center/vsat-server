import { IsUUID, IsOptional, IsString, IsBoolean } from 'class-validator';

export class UpdateSkillDto {
  @IsUUID()
  @IsOptional()
  domainId?: string;

  @IsString()
  @IsOptional()
  content?: string;

  @IsBoolean()
  @IsOptional()
  status?: boolean;
}
