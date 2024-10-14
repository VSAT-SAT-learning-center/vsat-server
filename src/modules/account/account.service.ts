import {
    HttpException,
    HttpStatus,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Account } from 'src/database/entities/account.entity';
import { Repository } from 'typeorm';
import { CreateAccountDTO } from './dto/create-account.dto';
import { plainToInstance } from 'class-transformer';
import * as bcrypt from 'bcrypt';
import { MailerService } from '@nestjs-modules/mailer';
import { Role } from 'src/database/entities/role.entity';

@Injectable()
export class AccountService {
    constructor(
        @InjectRepository(Account)
        private readonly accountRepository: Repository<Account>,
        private readonly mailerService: MailerService,
        @InjectRepository(Role)
        private readonly roleRepository: Repository<Role>,
    ) {}

    //save
    async save(accountDTO: CreateAccountDTO): Promise<CreateAccountDTO> {
        const roleId = await this.roleRepository.findOne({
            where: { id: accountDTO.roleId },
        });

        if (!roleId) {
            throw new NotFoundException(
                `Unit with ID ${accountDTO.roleId} does not exist`,
            );
        }

        const randomPassword = this.generateRandomPassword(8);

        const hashedPassword = await this.hashPassword(randomPassword);

        accountDTO.password = hashedPassword;

        const account = await this.accountRepository.create({
            ...accountDTO,
            role: roleId,
        });

        const saveAccount = await this.accountRepository.save(account);

        if (!saveAccount) {
            throw new HttpException(
                'Fail to save account',
                HttpStatus.BAD_REQUEST,
            );
        }

        await this.sendWelComeMail(
            accountDTO.email,
            randomPassword,
            accountDTO.username,
        );

        return plainToInstance(CreateAccountDTO, saveAccount, {
            excludeExtraneousValues: true,
        });
    }

    async active(userId: string) {
        const findAcc = await this.accountRepository.findOneBy({ id: userId });

        findAcc.status = true;

        return await this.accountRepository.save(findAcc);
    }

    generateRandomPassword(length: number): string {
        const chars =
            'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let password = '';
        for (let i = 0; i < length; i++) {
            const randomIndex = Math.floor(Math.random() * chars.length);
            password += chars[randomIndex];
        }
        return password;
    }

    async hashPassword(password: string): Promise<string> {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        return hashedPassword;
    }

    async sendWelComeMail(email: string, password: string, username: string) {
        await this.mailerService.sendMail({
            to: email,
            subject: 'Welcome to VSAT Learning Center!',
            template: './common/mail/templates/welcome.hbs',
            context: {
                username: username,
                password: password,
            },
        });

        return 'Welcome email sent';
    }
}
