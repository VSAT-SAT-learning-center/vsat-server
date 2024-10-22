import { ApiProperty } from '@nestjs/swagger';
import { IsUUID, IsString, IsNotEmpty, IsOptional, IsEnum } from 'class-validator';
import { FeedbackStatus } from 'src/common/enums/feedback-status.enum';

export class CreateFeedbackUnitDto {
  @ApiProperty({ description: 'ID của Unit liên quan đến feedback' })
  @IsUUID()
  unitId: string;

  @ApiProperty({ description: 'ID của Exam liên quan đến feedback' })
  @IsUUID()
  examId: string;

  @ApiProperty({ description: 'ID của Question liên quan đến feedback' })
  @IsUUID()
  questionId: string;

  @ApiProperty({ description: 'ID của tài khoản gửi feedback' })
  @IsUUID()
  accountFromId: string;

  @ApiProperty({ description: 'ID của tài khoản nhận feedback' })
  @IsUUID()
  accountToId: string;

  @ApiProperty({ description: 'Nội dung của feedback', required: false })
  @IsString()
  @IsOptional()
  content?: string;

  @ApiProperty({ enum: FeedbackStatus, description: 'Trạng thái của feedback' })
  @IsEnum(FeedbackStatus)
  status: FeedbackStatus;
}
