import { IsUUID, IsOptional, IsString, IsBoolean } from 'class-validator';

export class CreateSkillDto {
  @IsUUID()
  domainId: string;

  @IsString()
  @IsOptional()
  content?: string;

  @IsBoolean()
  @IsOptional()
  status?: boolean;
}
