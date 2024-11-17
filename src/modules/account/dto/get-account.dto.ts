import { Expose, Transform, Type } from 'class-transformer';
import { AccountStatus } from 'src/common/enums/account-status.enum';


export class GetAccountDTO {
    @Expose()
    id: string;

    @Expose()
    @Transform(({ obj }) => obj.role?.rolename)
    role: string;

    @Expose()
    firstname: string;

    @Expose()
    lastname: string;

    @Expose()
    username: string;

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
    isTrialExam: boolean;

    @Expose()
    status: AccountStatus;
}
