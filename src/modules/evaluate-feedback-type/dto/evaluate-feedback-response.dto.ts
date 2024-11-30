import { ApiProperty } from '@nestjs/swagger';
import { AccountDto } from 'src/common/dto/common.dto';
import { EvaluateFeedbackType } from 'src/common/enums/evaluate-feedback-type.enum';

export class EvaluateFeedbackResponseDto {
    @ApiProperty({ description: 'ID of the feedback.' })
    id: string;

    @ApiProperty({ description: 'Date when the feedback was created.' })
    createdAt: Date;

    @ApiProperty({ description: 'Date when the feedback was last updated.' })
    updatedAt: Date;

    @ApiProperty({ description: 'Narrative feedback provided.', required: false })
    narrativeFeedback?: string;

    @ApiProperty({ description: 'Indicates if the feedback was escalated.' })
    isEscalated: boolean;

    @ApiProperty({ enum: EvaluateFeedbackType, description: 'Type of feedback.' })
    evaluateFeedbackType: EvaluateFeedbackType;

    @ApiProperty({ description: 'Account details of the feedback giver.' })
    accountFrom: AccountDto;

    @ApiProperty({ description: 'Account details of the feedback recipient.' })
    accountTo: AccountDto;

}
