import { IsString, IsUUID, IsOptional, IsNotEmpty } from 'class-validator';

export class CreateCommentDto {
  @IsUUID()
  @IsNotEmpty()
  accountId: string; 

  @IsUUID()
  @IsOptional()
  parentCommentId?: string; 

  @IsUUID()
  @IsNotEmpty()
  lessonId: string; 

  @IsString()
  @IsNotEmpty()
  content: string; 

  @IsOptional()
  @IsUUID()
  childCommentId?: string; 

  @IsOptional()
  status?: boolean; 
}
