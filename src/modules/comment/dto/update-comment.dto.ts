import { IsString, IsUUID, IsOptional } from 'class-validator';

export class UpdateCommentDto {
  @IsUUID()
  @IsOptional()
  accountId?: string;

  @IsUUID()
  @IsOptional()
  parentCommentId?: string;

  @IsUUID()
  @IsOptional()
  lessonId?: string;

  @IsString()
  @IsOptional()
  content?: string;

  @IsOptional()
  @IsUUID()
  childCommentId?: string;

  @IsOptional()
  status?: boolean;
}
