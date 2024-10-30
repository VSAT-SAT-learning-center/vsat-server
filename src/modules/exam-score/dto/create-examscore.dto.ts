import { IsUUID, IsOptional } from 'class-validator';

export class CreateExamScoreDto {
  @IsUUID()
  examStructureId: string;

  @IsUUID()
  @IsOptional()
  createdBy?: string;

  @IsUUID()
  @IsOptional()
  updatedBy?: string;
}
