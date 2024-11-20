import { ApiProperty } from '@nestjs/swagger';
import { IsUUID, IsString, IsNotEmpty, IsOptional, IsEnum } from 'class-validator';
import { FeedbackStatus } from 'src/common/enums/feedback-status.enum';
import { Account } from 'src/database/entities/account.entity';
import { Exam } from 'src/database/entities/exam.entity';
import { Question } from 'src/database/entities/question.entity';
import { Unit } from 'src/database/entities/unit.entity';


export class CreateFeedbackDto {
  @ApiProperty()
  @IsUUID()
  @IsOptional()
  unitId?: string;

  @ApiProperty()
  @IsUUID()
  @IsOptional()
  examId?: string;

  @ApiProperty()
  @IsUUID()
  @IsOptional()
  questionId?: string;

  @ApiProperty()
  @IsUUID()
  accountFromId: string;

  @ApiProperty()
  @IsUUID()
  @IsOptional()
  accountToId?: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  content?: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  reason?: string;

  @ApiProperty({ enum: FeedbackStatus })
  @IsEnum(FeedbackStatus)
  @IsOptional()
  status?: FeedbackStatus;

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
