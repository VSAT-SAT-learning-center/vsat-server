import { IsString, IsOptional, IsUUID, IsDate, IsArray, IsNumber, isNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ExamStructureDto {
    @ApiProperty({ description: 'Unique identifier for the exam structure' })
    @IsUUID()
    id: string;

    @ApiProperty({ description: 'Name of the exam structure' })
    @IsString()
    name: string;

    @ApiProperty({ description: 'Type of the exam structure', required: false })
    @IsOptional()
    @IsString()
    structureType?: string;
}

export class DomainDistributionConfigDto {
    @ApiProperty({ description: 'Domain content', required: false })
    @IsOptional()
    @IsString()
    domain?: string;

    @ApiProperty({ description: 'Percentage of questions for this domain' })
    @IsNumber()
    percentage: number;

    @ApiProperty({})
    @IsNumber()
    minQuestion: number;

    @IsNumber()
    maxQuestion: number;
}

export class ExamSemesterWithDetailsDto {
    @ApiProperty({ description: 'Unique identifier for the exam semester' })
    @IsUUID()
    id: string;

    @ApiProperty({ description: 'Title of the exam semester' })
    @IsString()
    title: string;

    @ApiProperty({ description: 'Date and time of the exam semester' })
    @IsDate()
    time: Date;

    @ApiProperty({
        description: 'List of domain distribution configurations',
        type: [DomainDistributionConfigDto],
    })
    @IsArray()
    domainDistributionConfig: DomainDistributionConfigDto[];
}
