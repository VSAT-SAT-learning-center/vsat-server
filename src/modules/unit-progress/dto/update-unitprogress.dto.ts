import { ApiProperty } from '@nestjs/swagger';
import { IsUUID, IsInt, IsString, IsOptional, Min, Max } from 'class-validator';

export class UpdateUnitProgressDto {
    @ApiProperty({ description: 'des', example: 'String' })
    @IsUUID()
    @IsOptional()
    studyProfileId?: string;

    @ApiProperty({ description: 'des', example: 'String' })
    @IsUUID()
    @IsOptional()
    unitId?: string;

    @ApiProperty({ description: 'Progress in percentage', example: 50 })
    @IsInt()
    @Min(0)
    @Max(100)
    progress?: number;

    @ApiProperty({
        description: 'Status of the progress',
        example: 'completed',
    })
    status?: string;
}
