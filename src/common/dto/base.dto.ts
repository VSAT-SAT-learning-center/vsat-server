import { Expose } from 'class-transformer';
import { IsUUID, IsOptional } from 'class-validator';

export class BaseDTO {
    @IsUUID()
    @IsOptional()
    @Expose()
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
