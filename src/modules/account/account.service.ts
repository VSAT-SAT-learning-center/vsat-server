import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Account } from 'src/database/entities/account.entity';
import { Repository } from 'typeorm';
import { AccountDTO } from './dto/account.dto';
import { plainToInstance } from 'class-transformer';

@Injectable()
export class AccountService {
    constructor(
        @InjectRepository(Account)
        private readonly accountRepository: Repository<Account>,
    ) {}

    //save
    async save(accountDTO: AccountDTO): Promise<AccountDTO> {
        accountDTO.status = false;

        const saveAccount = await this.accountRepository.save(accountDTO);

        if (!saveAccount) {
            throw new HttpException(
                'Fail to save account',
                HttpStatus.BAD_REQUEST,
            );
        }

        return plainToInstance(AccountDTO, saveAccount, {
            excludeExtraneousValues: true,
        });
    }

    async active(userId: string) {
        const findAcc = await this.accountRepository.findOneBy({ id: userId });

        findAcc.status = true;

        return await this.accountRepository.save(findAcc);
    }
}
