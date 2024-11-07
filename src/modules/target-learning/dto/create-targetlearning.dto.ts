import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { IsUUID, IsBoolean, IsOptional } from 'class-validator';

export class CreateTargetLearningDto {
    levelId: string;

    sectionId: string;

    @IsUUID()
    @Expose()
    @ApiProperty({ example: '42c5a718-67f1-4c24-ba81-feecb9deb1f0' })
    studyProfileId: string;
}
