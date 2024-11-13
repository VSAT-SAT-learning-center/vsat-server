import { Expose, Type } from 'class-transformer';
import { Unit } from 'src/database/entities/unit.entity';

export class AccountDto {
    @Expose()
    id: string;

    @Expose()
    firstname: string;

    @Expose()
    lastname: string;
}


export class UnitFeedbackResponseDto {
    @Expose()
    id: string;

    @Expose()
    createdat: Date;

    @Expose()
    updatedat: Date;

    @Expose()
    unit: Unit;
    
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