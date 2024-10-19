import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty } from 'class-validator';
import { AccountStatus } from 'src/common/enums/account-status.enum';

export class UpdateAccountStatusDTO {
    @ApiProperty({
        description: 'New status of the account',
        enum: AccountStatus,
        example: AccountStatus.ACTIVE,
    })
    @IsEnum(AccountStatus)
    @IsNotEmpty()
    status: AccountStatus;
}
