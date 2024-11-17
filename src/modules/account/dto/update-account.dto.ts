import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { IsEnum, IsNotEmpty } from 'class-validator';
import { AccountStatus } from 'src/common/enums/account-status.enum';

export class UpdateAccountDTO {
    @ApiProperty()
    @Expose()
    firstname: string;

    @ApiProperty()
    @Expose()
    lastname: string;

    @ApiProperty()
    @Expose()
    phoneNumber: string;
}
