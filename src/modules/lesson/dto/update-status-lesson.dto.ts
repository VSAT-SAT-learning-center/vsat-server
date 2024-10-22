import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean } from 'class-validator';

export class UpdateLessonStatusDto {
    @ApiProperty()
    @IsBoolean()
    status?: boolean;
}
