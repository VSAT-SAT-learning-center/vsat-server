import { IsNotEmpty } from 'class-validator';
import { Role } from 'src/database/entities/role.entity';

export class AccountDTO {

    @IsNotEmpty()
    role: Role;

    @IsNotEmpty()
    username: string;

    @IsNotEmpty()
    password: string;

    firstname: string;

    lastname: string;

    @IsNotEmpty()
    email: string;

    status: boolean;
}
