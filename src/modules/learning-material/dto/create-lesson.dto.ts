import { ApiProperty } from '@nestjs/swagger';
import {
    IsString,
    IsUUID,
    IsNotEmpty,
    IsOptional,
    IsBoolean,
} from 'class-validator';

export class CreateLessonDto {
    @IsUUID()
    unitAreaId: string;

    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    title: string;
}
