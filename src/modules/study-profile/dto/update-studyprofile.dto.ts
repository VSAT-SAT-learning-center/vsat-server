import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { IsUUID, IsInt, IsOptional, IsDateString, IsString } from 'class-validator';

export class UpdateStudyProfileDto {
    
    @IsOptional()
    @ApiProperty()
    @Expose()
    startDate?: Date;

    
    @IsOptional()
    @ApiProperty()
    @Expose()
    endDate?: Date;
}
