import { IsUUID, IsOptional, IsInt, IsBoolean } from 'class-validator';

export class CreateQuizDto {
  @IsUUID()
  unitId: string;

  @IsInt()
  @IsOptional()
  totalQuestion?: number;

  @IsInt()
  @IsOptional()
  passingScore?: number;

  @IsBoolean()
  @IsOptional()
  status?: boolean;
}
