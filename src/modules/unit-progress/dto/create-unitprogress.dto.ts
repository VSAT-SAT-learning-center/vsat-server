import { ApiProperty } from '@nestjs/swagger';
import {
    IsUUID,
    IsInt,
    IsString,
    IsOptional,
    IsNotEmpty,
    Min,
    Max,
} from 'class-validator';

export class CreateUnitProgressDto {
    @ApiProperty({ description: 'ID của hồ sơ học tập' })
    @IsUUID()
    @IsNotEmpty()
    studyProfileId: string;

    @ApiProperty({ description: 'ID của unit' })
    @IsUUID()
    @IsNotEmpty()
    unitId: string;

    @ApiProperty({ description: 'Progress in percentage', example: 50 })
    @IsInt()
    @Min(0)
    @Max(100)
    progress: number;

    @ApiProperty({
        description: 'Status of the progress',
        example: 'in_progress',
    })
    @IsNotEmpty()
    status: string;
}
