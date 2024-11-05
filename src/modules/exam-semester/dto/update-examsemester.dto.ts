import { ApiProperty } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import {
    IsArray,
    IsDate,
    IsInt,
    IsNotEmpty,
    IsNumber,
    IsString,
    IsUUID,
    ValidateNested,
} from 'class-validator';
import { BaseDTO } from 'src/common/dto/base.dto';

export class UpdateDomainDistributionConfigDto {
    @Expose()
    @ApiProperty({ example: 'c1f12d3a-12f3-4e8c-8eab-6c0f09ae8d4a' })
    id: string;

    @Expose()
    @ApiProperty({ example: 'Algebra' })
    title: string;

    @Expose()
    @IsInt()
    @ApiProperty({ example: 5 })
    minQuestion: number;

    @Expose()
    @IsInt()
    @ApiProperty({ example: 10 })
    maxQuestion: number;

    @Expose()
    @IsNumber()
    @ApiProperty({ example: 20 })
    percent: number;

    @Expose()
    @ApiProperty({ example: 'Geometry and Measurements' })
    domain: string;
}

export class UpdateExamSemesterDto extends BaseDTO {
    @Expose()
    @ApiProperty({ example: '2023-01' })
    title: string;

    @Expose()
    @IsDate()
    @ApiProperty({ example: '2023-05-12' })
    time: Date;

    @ApiProperty({ type: [UpdateDomainDistributionConfigDto] })
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => UpdateDomainDistributionConfigDto)
    configs: UpdateDomainDistributionConfigDto[];
}
