import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
    IsUUID,
    IsInt,
    IsString,
    IsOptional,
    Min,
    Max,
    IsEnum,
} from 'class-validator';
import { ProgressStatus } from 'src/common/enums/progress-status.enum';

export class UpdateUnitProgressDto {
    @ApiProperty({ description: 'des', example: 'String' })
    @IsUUID()
    @IsOptional()
    targetLearningId?: string;

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
        enum: ProgressStatus,
        enumName: 'UnitStatus',
        example: ProgressStatus.NOT_STARTED,
        default: ProgressStatus.NOT_STARTED,
        required: false,
    })
    @IsEnum(ProgressStatus)
    @IsOptional()
    @Transform(({ value }) => value ?? ProgressStatus.NOT_STARTED)
    status?: ProgressStatus;
}
