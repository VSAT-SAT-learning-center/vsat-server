import { IsUUID, IsOptional } from 'class-validator';

export class UpdateExamScoreDto {
  @IsUUID()
  @IsOptional()
  examStructureId?: string;

  @IsUUID()
  @IsOptional()
  createdBy?: string;

  @IsUUID()
  @IsOptional()
  updatedBy?: string;
}
