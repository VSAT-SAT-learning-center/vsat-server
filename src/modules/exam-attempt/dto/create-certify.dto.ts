import { ApiProperty } from '@nestjs/swagger';
import { Expose, Transform } from 'class-transformer';
import { IsUUID, IsOptional } from 'class-validator';
import { format } from 'date-fns';

export class CreateCertifyDto {
    @ApiProperty()
    @Expose()
    scoreRW: number;

    @ApiProperty()
    @Expose()
    scorMath: number;

    @ApiProperty()
    @Expose()
    @IsUUID()
    studyProfileId: string;

    @ApiProperty()
    @Expose()
    @Transform(({ value }) => (value ? format(new Date(value), 'MM/dd/yyyy') : value))
    attemptdatetime: Date;
}
