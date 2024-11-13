import { Expose, Type } from 'class-transformer';
import { IsUUID, IsOptional, ValidateNested } from 'class-validator';
import { Account } from 'src/database/entities/account.entity';
import { GetAccountDTO } from 'src/modules/account/dto/get-account.dto';

export class BaseDTO {
    @IsOptional()
    @Expose()
    @ValidateNested()
    @Type(() => GetAccountDTO)
    account?: GetAccountDTO;

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

    // @IsUUID()
    // @IsOptional()
    // @Expose()
    // createdat?: string;

    // @IsUUID()
    // @IsOptional()
    // @Expose()
    // updatedat?: string;
}
