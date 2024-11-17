import { Expose } from 'class-transformer';
import { AccountStatus } from 'src/common/enums/account-status.enum';

export class AccountDTO {
    @Expose()
    id: string;

    @Expose()
    username: string;

    @Expose()
    email: string;

    @Expose()
    status: AccountStatus;
}
