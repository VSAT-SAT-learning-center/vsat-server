import { Expose, Type } from 'class-transformer';
import { Lesson } from 'src/database/entities/lesson.entity';
import { Question } from 'src/database/entities/question.entity';

export class AccountDto {
    @Expose()
    firstname: string;

    @Expose()
    lastname: string;
}

export class ModuleTypeDto {
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
    name: string;

    @Expose()
    level: string;

    @Expose()
    numberofquestion: number;

    @Expose()
    time: number;

    @Expose()
    status: boolean;
}


export class ModuleTypeFeedbackResponseDto {
    @Expose()
    id: string;

    @Expose()
    createdat: Date;

    @Expose()
    updatedat: Date;

    @Expose()
    @Type(() => ModuleTypeDto)
    moduleType: ModuleTypeDto;
    
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
