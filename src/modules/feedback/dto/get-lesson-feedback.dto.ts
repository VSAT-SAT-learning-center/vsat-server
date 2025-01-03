import { Expose, Type } from 'class-transformer';
import { LessonType } from 'src/common/enums/lesson-type.enum';
import { Lesson } from 'src/database/entities/lesson.entity';

export class AccountDto {
    @Expose()
    firstname: string;

    @Expose()
    lastname: string;
}

export class LessonDto {
    @Expose()
    id: string;

    @Expose()
    createdat: Date;

    @Expose()
    createdby: string;

    @Expose()
    updatedat: Date;

    @Expose()
    updatedby: string;

    @Expose()
    title: string;

    @Expose()
    type: LessonType;
}

export class LessonFeedbackResponseDto {
    @Expose()
    id: string;

    @Expose()
    createdat: Date;

    @Expose()
    updatedat: Date;

    @Expose()
    @Type(() => LessonDto)
    lesson: LessonDto;

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
