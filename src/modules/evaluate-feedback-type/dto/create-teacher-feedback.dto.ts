import { ApiProperty } from '@nestjs/swagger';
import {
    IsOptional,
    IsString,
} from 'class-validator';

export class CreateTeacherFeedbackDto {
    accountFromId: string;

    @ApiProperty()
    @IsString()
    accountToId: string;

    @ApiProperty({ required: false })
    @IsString()
    @IsOptional()
    reason?: string;

    @ApiProperty({ description: 'Narrative feedback.', required: false })
    @IsString()
    @IsOptional()
    narrativeFeedback?: string;
}
