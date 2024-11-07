import { ApiProperty } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import {
    IsString,
    IsInt,
    Min,
    Max,
    IsNotEmpty,
    IsDate,
    IsArray,
    ValidateNested,
} from 'class-validator';

export class UploadFileDomainDistributionConfigDto {

    @Expose()
    @ApiProperty({ example: 5 })
    @IsInt()
    @Min(1)
    minQuestion: number;

    @Expose()
    @ApiProperty({ example: 10 })
    @IsInt()
    @Min(1)
    maxQuestion: number;

    @Expose()
    @ApiProperty({ example: 20 })
    @IsInt()
    @Min(0)
    @Max(100)
    percent: number;

    @Expose()
    @ApiProperty({ example: 'Expression of Ideas' })
    @IsString()
    @IsNotEmpty()
    domain: string;
}

export class UploadFileExamSemesterDto {
    @Expose()
    @ApiProperty({ example: 'Title this' })
    @IsString()
    @IsNotEmpty()
    title: string;

    @Expose()
    @ApiProperty()
    time: Date;

    @Expose()
    @ApiProperty({ type: [UploadFileDomainDistributionConfigDto] })
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => UploadFileDomainDistributionConfigDto)
    domainDistributionConfig: UploadFileDomainDistributionConfigDto[];
}
