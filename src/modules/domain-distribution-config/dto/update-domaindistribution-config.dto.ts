import { ApiProperty } from "@nestjs/swagger";
import { IsInt, IsString, IsUUID } from "class-validator";

export class UpdateDomainDistributionConfigDto {
    @ApiProperty()
    @IsUUID()
    id: string;

    @IsString()
    @ApiProperty()
    domain: string;

    @IsInt()
    @ApiProperty()
    percent?: number;

    @IsInt()
    @ApiProperty()
    minQuestion?: number;

    @IsInt()
    @ApiProperty()
    maxQuestion?: number;
}