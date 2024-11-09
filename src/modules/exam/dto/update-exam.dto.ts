import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { IsString, IsUUID, IsBoolean, IsOptional } from 'class-validator';
import { ExamStatus } from 'src/common/enums/exam-status.enum';

export class UpdateExamDto {
    @IsUUID()
    @IsOptional()
    @Expose()
    examStructureId?: string;

    @IsUUID()
    @IsOptional()
    @Expose()
    examTypeId?: string;

    @IsString()
    @IsOptional()
    @Expose()
    title?: string;

    @IsString()
    @IsOptional()
    @Expose()
    description?: string;

    @IsBoolean()
    @IsOptional()
    @Expose()
    status?: ExamStatus;

    @ApiProperty()
    @IsOptional()
    countfeedback?: number;

    @ApiProperty()
    @IsOptional()
    @IsBoolean()
    isActive?: boolean;
}
