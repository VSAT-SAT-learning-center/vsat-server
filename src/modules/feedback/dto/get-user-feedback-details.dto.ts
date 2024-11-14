import { Expose, Type } from 'class-transformer';
import { AccountDto, ExamDto, QuestionDto, UnitDto } from 'src/common/dto/common.dto';

export class UserFeedbackResponseDto {
    @Expose()
    id: string;

    @Expose()
    content: string;

    @Expose()
    status: string;

    @Expose()
    createdat: Date;

    @Expose()
    updatedat: Date;

    @Expose()
    @Type(() => UnitDto)
    unit?: UnitDto;

    @Expose()
    @Type(() => ExamDto)
    exam?: ExamDto;

    @Expose()
    @Type(() => QuestionDto)
    question?: QuestionDto;

    @Expose()
    @Type(() => AccountDto)
    accountFrom: AccountDto;

    @Expose()
    @Type(() => AccountDto)
    accountTo: AccountDto;
}