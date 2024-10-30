import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { IsString, IsUUID, IsOptional, IsNotEmpty } from 'class-validator';

export class GetExamStructureDto {
    @IsString()
    @ApiProperty()
    @Expose()
    @IsNotEmpty()
    structurename: string;

    @IsString()
    @ApiProperty()
    @Expose()
    @IsNotEmpty()
    description?: string;
}
