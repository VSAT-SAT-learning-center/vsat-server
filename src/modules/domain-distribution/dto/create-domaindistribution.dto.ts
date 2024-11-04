import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { IsUUID, IsInt, Min } from 'class-validator';

export class CreateDomainDistributionDto {
    @Expose()
    @ApiProperty()
    domain: string;

    @Expose()
    @ApiProperty()
    numberOfQuestion: number;
}
