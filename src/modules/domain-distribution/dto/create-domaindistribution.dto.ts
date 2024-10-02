import { IsUUID, IsInt, Min } from 'class-validator';

export class CreateDomainDistributionDto {
  @IsUUID()
  domainId: string;

  @IsUUID()
  moduleTypeId: string;

  @IsInt()
  @Min(1)
  minquestion: number;

  @IsInt()
  @Min(1)
  maxquestion: number;
}
