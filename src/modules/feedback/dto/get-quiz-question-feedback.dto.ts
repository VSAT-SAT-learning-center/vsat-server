import { Expose, Type } from 'class-transformer';
import { QuizQuestion } from 'src/database/entities/quizquestion.entity';

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
    quizQuestion: QuizQuestion;
    
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