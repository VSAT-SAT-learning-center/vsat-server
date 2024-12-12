import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { IsUUID, IsBoolean, IsOptional } from 'class-validator';

export class CreateTargetLearningDetailDto {
    levelId: string;

    sectionId: string;

    @Expose()
    @ApiProperty()
    targetLearningRW: number;

    @ApiProperty()
    @Expose()
    targetLearningMath: number;
}
