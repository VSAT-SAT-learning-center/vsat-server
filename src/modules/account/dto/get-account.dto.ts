import { Expose, Type } from 'class-transformer';
import { AccountStatus } from 'src/common/enums/account-status.enum';

export class RoleDTO {
    @Expose()
    role: string;
}

export class GetAccountDTO {
    @Expose()
    id: string;

    @Expose()
    @Type(() => RoleDTO)
    role: RoleDTO;

    @Expose()
    firstname: string;

    @Expose()
    lastname: string;

    @Expose()
    gender: boolean;

    @Expose()
    dateofbirth: Date;

    @Expose()
    phonenumber: string;

    @Expose()
    email: string;

    @Expose()
    address: string;

    @Expose()
    profilepictureurl: string;

    @Expose()
    status: AccountStatus;
}
