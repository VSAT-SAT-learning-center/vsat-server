import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsString, IsUUID } from 'class-validator';

export class UpdateDomainDistributionConfigDto {
    @ApiProperty()
    @IsUUID()
    id: string;

    @IsString()
    @ApiProperty()
    domain: string;

    @IsInt()
    @ApiProperty()
    percentage?: number;

    @IsInt()
    @ApiProperty()
    minQuestion?: number;

    @IsInt()
    @ApiProperty()
    maxQuestion?: number;
}
