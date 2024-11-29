import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { IsUUID, IsInt, IsOptional, IsDateString, IsString } from 'class-validator';

export class CreateStudyProfileDto {
    @IsUUID()
    @ApiProperty()
    @Expose()
    accountId: string;

    @IsInt()
    @ApiProperty()
    @Expose()
    targetscoreMath?: number;

    @IsInt()
    @ApiProperty()
    @Expose()
    targetscoreRW?: number;

    @IsDateString()
    @ApiProperty()
    @Expose()
    startDate?: Date;

    @IsDateString()
    @ApiProperty()
    @Expose()
    endDate?: Date;
}
