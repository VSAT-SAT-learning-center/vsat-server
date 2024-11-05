import { IsString, IsInt, Min, Max, IsNotEmpty, IsDate } from 'class-validator';

export class CreateDomainDistributionConfigDto {
    @IsString()
    @IsNotEmpty()
    title: string;

    @IsInt()
    @Min(1)
    minQuestion: number;

    @IsInt()
    @Min(1)
    maxQuestion: number;

    @IsInt()
    @Min(0)
    @Max(100)
    percent: number;

    @IsString()
    @IsNotEmpty()
    domain: string;
}

export class CreateExamSemesterDto {
    @IsString()
    @IsNotEmpty()
    title: string;

    @IsDate()
    time: Date;
}
