import { IsUUID, IsInt, IsOptional } from 'class-validator';

export class CreateExamScoreDetailDto {
  @IsUUID()
  examScoreId: string;

  @IsUUID()
  sectionId: string;

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
