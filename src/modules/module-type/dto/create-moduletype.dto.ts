import { ApiProperty } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import {
    IsUUID,
    IsOptional,
    IsString,
    IsInt,
    IsBoolean,
    IsNotEmpty,
} from 'class-validator';
import { CreateDomainDistributionDto } from 'src/modules/domain-distribution/dto/create-domaindistribution.dto';

export class CreateModuleTypeDto {
    @Expose()
    @ApiProperty()
    section: string;

    @IsString()
    @Expose()
    @ApiProperty()
    name: string;

    @IsString()
    @Expose()
    @ApiProperty()
    level: string;

    @IsInt()
    @Expose()
    @ApiProperty()
    numberOfQuestion: number;

    @ApiProperty({ type: [CreateDomainDistributionDto] })
    @Type(() => CreateDomainDistributionDto)
    domainDistribution: CreateDomainDistributionDto;
}
