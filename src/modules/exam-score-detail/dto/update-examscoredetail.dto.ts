import { IsUUID, IsInt, IsOptional } from 'class-validator';

export class UpdateExamScoreDetailDto {
  @IsUUID()
  @IsOptional()
  examScoreId?: string;

  @IsUUID()
  @IsOptional()
  sectionId?: string;

  @IsInt()
  @IsOptional()
  rawscore?: number;

  @IsInt()
  @IsOptional()
  lowerscore?: number;

  @IsInt()
  @IsOptional()
  upperscore?: number;
}
