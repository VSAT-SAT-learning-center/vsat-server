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
import { AccountStatus } from 'src/common/enums/account-status.enum';
import { CreateAccountFromFileDTO } from './dto/create-account-file.dto';
import { GetAccountDTO } from './dto/get-account.dto';

@Injectable()
export class AccountService {
    constructor(
        @InjectRepository(Account)
        private readonly accountRepository: Repository<Account>,
        private readonly mailerService: MailerService,
        @InjectRepository(Role)
        private readonly roleRepository: Repository<Role>,
    ) {}

    async generateUsername(
        firstname: string,
        lastname: string,
    ): Promise<string> {
        const baseUsername =
            firstname.toLowerCase() +
            lastname
                .split(' ')
                .map((word) => word[0].toLowerCase())
                .join('');
        let username = baseUsername;

        let userExists = await this.accountRepository.findOne({
            where: { username },
        });
        let counter = 1;

        while (userExists) {
            username = `${baseUsername}${counter}`;
            userExists = await this.accountRepository.findOne({
                where: { username },
            });
            counter++;
        }

        return username;
    }

    //save
    async save(accountDTO: CreateAccountDTO): Promise<CreateAccountDTO> {
        const roleId = await this.roleRepository.findOne({
            where: { id: accountDTO.roleId },
        });

        const email = await this.accountRepository.findOne({
            where: { email: accountDTO.email },
        });

        if (email) {
            throw new HttpException(
                `Email: ${accountDTO.email} already exist`,
                HttpStatus.BAD_REQUEST,
            );
        }

        if (!roleId) {
            throw new NotFoundException(
                `Unit with ID ${accountDTO.roleId} does not exist`,
            );
        }

        const generatedUsername = await this.generateUsername(
            accountDTO.firstname,
            accountDTO.lastname,
        );

        const randomPassword = this.generateRandomPassword(8);

        const hashedPassword = await this.hashPassword(randomPassword);

        const account = await this.accountRepository.create({
            ...accountDTO,
            password: hashedPassword,
            username: generatedUsername,
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
            generatedUsername,
        );

        return plainToInstance(CreateAccountDTO, saveAccount, {
            excludeExtraneousValues: true,
        });
    }

    async active(userId: string) {
        const findAcc = await this.accountRepository.findOneBy({ id: userId });

        findAcc.status = AccountStatus.ACTIVE;

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

    async saveFromFile(
        createAccountFromFileDto: CreateAccountFromFileDTO[],
    ): Promise<CreateAccountFromFileDTO[]> {
        const savedAccounts: Account[] = [];

        for (const account of createAccountFromFileDto) {
            const checkRole = await this.roleRepository.findOne({
                where: { rolename: account.role },
            });

            if (!checkRole) {
                throw new NotFoundException(`Role ${account.role} not found`);
            }

            const generatedUsername = await this.generateUsername(
                account.firstname,
                account.lastname,
            );

            const randomPassword = this.generateRandomPassword(8);

            const hashedPassword = await this.hashPassword(randomPassword);

            account.password = hashedPassword;

            const newAccount = this.accountRepository.create({
                username: generatedUsername,
                password: hashedPassword,
                firstname: account.firstname,
                lastname: account.lastname,
                email: account.email,
                gender: account.gender,
                dateofbirth: account.dateofbirth,
                phonenumber: account.phonenumber,
                role: checkRole,
            });

            const savedAccount = await this.accountRepository.save(newAccount);

            if (!savedAccount) {
                throw new HttpException(
                    'Fail to save account',
                    HttpStatus.BAD_REQUEST,
                );
            }

            await this.sendWelComeMail(
                account.email,
                randomPassword,
                generatedUsername,
            );

            savedAccounts.push(savedAccount);
        }
        return plainToInstance(CreateAccountFromFileDTO, savedAccounts, {
            excludeExtraneousValues: true,
        });
    }

    async find(page: number, pageSize: number): Promise<any> {
        const skip = (page - 1) * pageSize;

        const [accounts, total] = await this.accountRepository.findAndCount({
            relations: ['role'],
            skip: skip,
            take: pageSize,
        });

        const totalPages = Math.ceil(total / pageSize);

        return {
            data: plainToInstance(GetAccountDTO, accounts, {
                excludeExtraneousValues: true,
            }),
            totalPages: totalPages,
            currentPage: page,
            totalItems: total,
        };
    }
}
