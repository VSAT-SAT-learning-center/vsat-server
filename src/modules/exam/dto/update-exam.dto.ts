import { Expose } from 'class-transformer';
import { IsString, IsUUID, IsBoolean, IsOptional } from 'class-validator';

export class UpdateExamDto {
    @IsUUID()
    @IsOptional()
    @Expose()
    examStructureId?: string;

    @IsUUID()
    @IsOptional()
    @Expose()
    examTypeId?: string;

    @IsString()
    @IsOptional()
    @Expose()
    title?: string;

    @IsString()
    @IsOptional()
    @Expose()
    description?: string;

    @IsBoolean()
    @IsOptional()
    @Expose()
    status?: boolean;
}
