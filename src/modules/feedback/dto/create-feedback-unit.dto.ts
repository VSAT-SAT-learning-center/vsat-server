import { ApiProperty } from '@nestjs/swagger';
import { IsUUID, IsString, IsNotEmpty, IsOptional, IsEnum } from 'class-validator';
import { FeedbackStatus } from 'src/common/enums/feedback-status.enum';
import { Account } from 'src/database/entities/account.entity';
import { Exam } from 'src/database/entities/exam.entity';
import { Question } from 'src/database/entities/question.entity';
import { Unit } from 'src/database/entities/unit.entity';


export class CreateFeedbackUnitDto {
  @ApiProperty({ description: 'ID của Unit liên quan đến feedback' })
  @IsUUID()
  @IsOptional()
  unitId?: string;

  @ApiProperty({ description: 'ID của Exam liên quan đến feedback' })
  @IsUUID()
  @IsOptional()
  examId?: string;

  @ApiProperty({ description: 'ID của Question liên quan đến feedback' })
  @IsUUID()
  @IsOptional()
  questionId?: string;

  @ApiProperty({ description: 'ID của tài khoản gửi feedback' })
  @IsUUID()
  accountFromId: string;

  @ApiProperty({ description: 'ID của tài khoản nhận feedback' })
  @IsUUID()
  @IsOptional()
  accountToId?: string;

  @ApiProperty({ description: 'Nội dung của feedback', required: false })
  @IsString()
  @IsOptional()
  content?: string;

  @ApiProperty({ enum: FeedbackStatus, description: 'Trạng thái của feedback' })
  @IsEnum(FeedbackStatus)
  status: FeedbackStatus;

  @IsOptional()
  unit?: Unit;

  @IsOptional()
  exam?: Exam;

  @IsOptional()
  question?: Question;

  @IsOptional()
  accountFrom?: Account;

  @IsOptional()
  accountTo?: Account;

}
