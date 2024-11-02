import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { IsUUID, IsInt, Min } from 'class-validator';

export class CreateDomainDistributionDto {
    @IsUUID()
    @Expose()
    @ApiProperty()
    domainId: string;

    @IsUUID()
    @Expose()
    @ApiProperty()
    moduleTypeId: string;

    @IsInt()
    @Expose()
    @ApiProperty()
    minquestion: number;

    @IsInt()
    @Expose()
    @ApiProperty()
    maxquestion: number;
}
