import { GetAccountDTO } from "src/modules/account/dto/get-account.dto";

export class SocketNotificationDto {
    accountFrom: GetAccountDTO;
    message: string;
    createdAt: Date;
}