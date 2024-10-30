import { Expose, Type } from 'class-transformer';
import { Question } from 'src/database/entities/question.entity';

export class AccountDto {
    @Expose()
    firstname: string;

    @Expose()
    lastname: string;
}


export class QuestionFeedbackResponseDto {
    @Expose()
    id: string;

    @Expose()
    createdat: Date;

    @Expose()
    updatedat: Date;

    @Expose()
    question: Question; // Ensure Question is also a serialized DTO if necessary

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