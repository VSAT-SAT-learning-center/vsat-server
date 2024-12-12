import { Expose } from 'class-transformer';

export class UnitDto {
    @Expose()
    id: string;

    @Expose()
    title: string;

    @Expose()
    description: string;
}

export class UnitAreaDto {
    @Expose()
    id: string;

    @Expose()
    title: string;

    @Expose()
    description: string;
}

export class LessonDto {
    @Expose()
    id: string;

    @Expose()
    title: string;

    @Expose()
    description: string;
}

export class ExamDto {
    @Expose()
    id: string;

    @Expose()
    name: string;
}

export class QuestionDto {
    @Expose()
    id: string;

    @Expose()
    text: string;
}

export class SectionDto {
    @Expose()
    id: string;

    @Expose()
    name: string;
}

export class DomainDto {
    @Expose()
    id: string;

    @Expose()
    name: string;
}

export class SkillDto {
    @Expose()
    id: string;

    @Expose()
    content: string;
}

export class AccountDto {
    @Expose()
    id: string;

    @Expose()
    username: string;

    @Expose()
    firstname: string;

    @Expose()
    lastname: string;

    @Expose()
    profilePicture: string;
}
