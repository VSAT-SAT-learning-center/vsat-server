import { Expose, Type } from 'class-transformer';
import { IsUUID, IsOptional, ValidateNested } from 'class-validator';
import { Account } from 'src/database/entities/account.entity';
import { AccountDTO } from 'src/modules/account/dto/account.dto';
import { GetAccountDTO } from 'src/modules/account/dto/get-account.dto';

export class BaseDTO {
    @IsOptional()
    @Expose()
    @ValidateNested()
    @Type(() => AccountDTO)
    account?: AccountDTO;

    @IsUUID()
    @IsOptional()
    @Expose()
    @ValidateNested()
    @Type(() => Account)
    createdby?: string;

    @IsUUID()
    @IsOptional()
    @Expose()
    updatedby?: string;

    @IsUUID()
    @IsOptional()
    @Expose()
    createdat?: string;

    @IsUUID()
    @IsOptional()
    @Expose()
    updatedat?: string;
}
