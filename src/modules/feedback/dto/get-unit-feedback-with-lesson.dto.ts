import { Expose, Type } from 'class-transformer';
import { FeedbackStatus } from 'src/common/enums/feedback-status.enum';

export class AccountDto {
    @Expose()
    id: string;

    @Expose()
    firstName: string;

    @Expose()
    lastName: string;
}

export class LessonDto {
    @Expose()
    id: string;

    @Expose()
    title: string;

    @Expose()
    description: string;
}

export class UnitFeedbackWithLessonResponseDto {
    @Expose()
    id: string;

    @Expose()
    createdAt: Date;

    @Expose()
    updatedAt: Date;

    @Expose()
    content: string;

    @Expose()
    reason: string;

    @Expose()
    status: FeedbackStatus;

    @Expose()
    @Type(() => LessonDto)
    lesson: LessonDto;

    @Expose()
    @Type(() => AccountDto)
    accountFrom: AccountDto;

    @Expose()
    @Type(() => AccountDto)
    accountTo: AccountDto;
}
