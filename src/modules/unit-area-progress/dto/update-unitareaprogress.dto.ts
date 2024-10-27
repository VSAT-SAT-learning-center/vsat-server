import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsUUID, IsInt, IsOptional, IsString, IsEnum } from 'class-validator';
import { ProgressStatus } from 'src/common/enums/progress-status.enum';

export class UpdateUnitAreaProgressDto {
    @IsUUID()
    @IsOptional()
    unitAreaId?: string;

    @IsUUID()
    @IsOptional()
    unitProgressId?: string;

    @IsInt()
    @IsOptional()
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
