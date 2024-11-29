import { ApiProperty } from '@nestjs/swagger';
import { AccountDto } from 'src/common/dto/common.dto';

export class StudyProfileFeedbackResponseDto {
    @ApiProperty({ description: 'ID of the feedback.' })
    id: string;

    @ApiProperty({ description: 'Account details of the feedback giver.' })
    accountFrom: AccountDto;

    @ApiProperty({ description: 'Account details of the feedback recipient.' })
    accountTo: AccountDto;

    @ApiProperty({ required: false })
    studyProfileId: string;
}
