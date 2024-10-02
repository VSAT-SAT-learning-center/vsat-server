import { IsString, IsUUID, IsOptional, IsNotEmpty } from 'class-validator';

export class CreateDomainDto {
  @IsUUID()
  @IsNotEmpty()
  sectionId: string;

  @IsString()
  @IsOptional()
  content?: string;

  @IsOptional()
  status?: boolean;
}
