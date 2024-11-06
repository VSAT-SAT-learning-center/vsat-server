import { ApiProperty } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import { IsString, ValidateNested, IsArray, IsUUID, IsInt, IsNumber } from 'class-validator';

export class CreateDomainDistributionConfigDto {
    @ApiProperty()
    @Expose()
    @IsString()
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

export class CreateExamSemeseterDto {
    @ApiProperty()
    @Expose()
    @IsString()
    title: string;

    @ApiProperty()
    @Expose()
    @IsString()
    time: string;

    @ApiProperty({ type: [CreateDomainDistributionConfigDto] })
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => CreateDomainDistributionConfigDto)
    createDomainDistributionConfig: CreateDomainDistributionConfigDto[];
}
