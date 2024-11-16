import { Expose } from 'class-transformer';

export class AccountDTO {
    @Expose()
    id: string;

    @Expose()
    username: string;

    @Expose()
    email: string;
}
