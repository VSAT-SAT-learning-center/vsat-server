import { Expose, Type } from 'class-transformer';
import { Exam } from 'src/database/entities/exam.entity';

export class AccountDto {
    @Expose()
    firstname: string;

    @Expose()
    lastname: string;
}


export class ExamFeedbackResponseDto {
    @Expose()
    id: string;

    @Expose()
    createdat: Date;

    @Expose()
    updatedat: Date;

    @Expose()
    exam: Exam;
    
    @Expose()
    @Type(() => AccountDto)
    accountFrom: AccountDto;

    @Expose()
    @Type(() => AccountDto)
    accountTo: AccountDto;

    @Expose()
    content: string;

    @Expose()
    reason: string;
}