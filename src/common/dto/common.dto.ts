import { Expose } from 'class-transformer';

export class UnitDto {
    @Expose()
    id: string;

    @Expose()
    title: string;
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

    // @Expose()
    // gender: boolean;

    // @Expose()
    // dateofbirth: Date;

    // @Expose()
    // phonenumber: string;

    // @Expose()
    // email: string;

    // @Expose()
    // address: string; 
}