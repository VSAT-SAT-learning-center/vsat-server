import { ApiProperty } from '@nestjs/swagger';
import {
    IsBoolean,
    IsOptional,
    IsString,
} from 'class-validator';

export class CreateFeedbackDto {
    accountFromId: string;

    @ApiProperty({ required: false })
    @IsString()
    @IsOptional()
    reason?: string;

    @ApiProperty({ description: 'Narrative feedback.', required: false })
    @IsString()
    @IsOptional()
    narrativeFeedback?: string;

    @ApiProperty()
    @IsBoolean()
    @IsOptional()
    isSendToStaff?: boolean;
}
