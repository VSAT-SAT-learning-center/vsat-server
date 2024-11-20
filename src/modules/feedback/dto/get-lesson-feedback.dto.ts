import { Expose, Type } from 'class-transformer';
import { Lesson } from 'src/database/entities/lesson.entity';
import { Question } from 'src/database/entities/question.entity';

export class AccountDto {
    @Expose()
    firstname: string;

    @Expose()
    lastname: string;
}

export class LessonFeedbackResponseDto {
    @Expose()
    id: string;

    @Expose()
    createdat: Date;

    @Expose()
    updatedat: Date;

    @Expose()
    lesson: Lesson;
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
