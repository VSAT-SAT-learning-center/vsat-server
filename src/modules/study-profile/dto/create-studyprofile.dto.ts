import { IsUUID, IsInt, IsOptional, IsDateString, IsString } from 'class-validator';

export class CreateStudyProfileDto {
  @IsUUID()
  accountId: string;

  @IsInt()
  @IsOptional()
  targetScore?: number;

  @IsDateString()
  @IsOptional()
  startDate?: Date;

  @IsDateString()
  @IsOptional()
  endDate?: Date;

  @IsString()
  @IsOptional()
  status?: string;
}
