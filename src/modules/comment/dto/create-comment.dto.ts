import { IsString, IsUUID, IsOptional, IsNotEmpty } from 'class-validator';

export class CreateCommentDto {
  @IsUUID()
  @IsNotEmpty()
  accountId: string; // UUID của người dùng tạo comment

  @IsUUID()
  @IsOptional()
  parentCommentId?: string; // UUID của comment cha (nếu có)

  @IsUUID()
  @IsNotEmpty()
  lessonId: string; // UUID của lesson liên quan

  @IsString()
  @IsNotEmpty()
  content: string; // Nội dung của comment

  @IsOptional()
  @IsUUID()
  childCommentId?: string; // UUID của comment con (nếu có)

  @IsOptional()
  status?: boolean; // Trạng thái của comment (mặc định là true)
}
