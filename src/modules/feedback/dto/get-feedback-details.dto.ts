import { Expose, Type } from "class-transformer";
import { ExamStatus } from "src/common/enums/exam-status.enum";
import { LessonType } from "src/common/enums/lesson-type.enum";
import { UnitStatus } from "src/common/enums/unit-status.enum";

export class UnitDto {
    @Expose()
    id: string;

    @Expose()
    title: string;

    @Expose()
    description: string;

    @Expose()
    status: UnitStatus;
}

export class QuestionDto {
    @Expose()
    id: string;

    @Expose()
    content: string;

    @Expose()
    explain: string;

    @Expose()
    isSingleChoiceQuestion: boolean;
}

export class ExamDto {
    @Expose()
    id: string;

    @Expose()
    title: string;

    @Expose()
    description: string;

    @Expose()
    status: ExamStatus;
}

export class LessonDto {
    @Expose()
    id: string;

    @Expose()
    title: string;

    @Expose()
    type: LessonType;

    @Expose()
    status: boolean;
}

export class AccountDto {
    @Expose()
    firstname: string;

    @Expose()
    lastname: string;
}

export class FeedbackDetailResponseDto {
    @Expose()
    id: string;

    @Expose()
    createdat: Date;

    @Expose()
    updatedat: Date;

    @Expose()
    content: string;

    @Expose()
    reason: string;

    @Expose()
    @Type(() => LessonDto)
    lesson: LessonDto;

    @Expose()
    @Type(() => UnitDto)
    unit: UnitDto;

    @Expose()
    @Type(() => ExamDto)
    exam: ExamDto;

    @Expose()
    @Type(() => QuestionDto)
    question: QuestionDto;

    @Expose()
    @Type(() => AccountDto)
    accountFrom: AccountDto;

    @Expose()
    @Type(() => AccountDto)
    accountTo: AccountDto;
}