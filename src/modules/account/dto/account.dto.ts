import { Role } from 'src/database/entities/role.entity';

export class AccountDTO {
    role: Role;

    username: string;

    passwordhash: string;

    firstname: string;

    lastname: string;

    gender: boolean;

    dateofbirth: Date;

    phonenumber: string;

    email: string;

    address: string;

    profilepictureurl: string;

    status: boolean;
}
