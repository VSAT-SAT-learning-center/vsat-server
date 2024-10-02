import { IsUUID, IsInt, Min, IsOptional } from 'class-validator';

export class UpdateDomainDistributionDto {
  @IsUUID()
  @IsOptional()
  domainId?: string;

  @IsUUID()
  @IsOptional()
  moduleTypeId?: string;

  @IsInt()
  @Min(1)
  @IsOptional()
  minquestion?: number;

  @IsInt()
  @Min(1)
  @IsOptional()
  maxquestion?: number;
}
