import { ApiProperty } from '@nestjs/swagger';
import {
    IsString,
    IsUUID,
    IsNotEmpty,
    IsOptional,
    IsBoolean,
} from 'class-validator';

export class CreateLessonDto {
    @ApiProperty({
        example: '763e9e17-350e-4d84-bba3-1eab8c4326fa',
    })
    @IsUUID()
    @IsNotEmpty()
    unitAreaId: string;

    @ApiProperty()
    @IsUUID()
    @IsOptional()
    prerequisiteLessonId?: string;

    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    title: string;

    @ApiProperty()
    @IsBoolean()
    @IsOptional()
    status?: boolean;
}
