import {
    HttpException,
    HttpStatus,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Account } from 'src/database/entities/account.entity';
import { ILike, Like, Repository } from 'typeorm';
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

    isValidEmail(email: string): boolean {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    //save
    async save(accountDTO: CreateAccountDTO): Promise<CreateAccountDTO> {
        const role = await this.roleRepository.findOne({
            where: { rolename: accountDTO.role },
        });

        const email = await this.accountRepository.findOne({
            where: { email: accountDTO.email },
        });

        const formattedDate = this.formatDateString(accountDTO.dateofbirth);

        if (new Date(formattedDate) > new Date()) {
            throw new HttpException(
                'Date of birth cannot be in the future',
                HttpStatus.BAD_REQUEST,
            );
        }

        if (!this.isValidEmail(accountDTO.email)) {
            throw new HttpException(
                'Email không hợp lệ',
                HttpStatus.BAD_REQUEST,
            );
        }

        if (email) {
            throw new HttpException(
                `Email: ${accountDTO.email} already exist`,
                HttpStatus.BAD_REQUEST,
            );
        }

        if (!role) {
            throw new NotFoundException(
                `Role ${accountDTO.role} does not exist`,
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
            role: role,
            dateofbirth: formattedDate,
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

    formatDateString(dateString: string): string {
        const [day, month, year] = dateString.split('/');
        return `${year}-${month}-${day}`;
    }

    async saveFromFile(
        createAccountFromFileDto: CreateAccountFromFileDTO[],
    ): Promise<{
        savedAccounts: CreateAccountFromFileDTO[];
        errors: { account: CreateAccountFromFileDTO; message: string }[];
    }> {
        const savedAccounts: Account[] = [];
        const errors: { account: CreateAccountFromFileDTO; message: string }[] =
            [];

        for (const account of createAccountFromFileDto) {
            try {
                const checkRole = await this.roleRepository.findOne({
                    where: { rolename: account.role },
                });

                if (!checkRole) {
                    throw new NotFoundException(
                        `Role ${account.role} not found`,
                    );
                }

                const formattedDate = this.formatDateString(
                    account.dateofbirth,
                );
                if (new Date(formattedDate) > new Date()) {
                    throw new HttpException(
                        'Date of birth cannot be in the future',
                        HttpStatus.BAD_REQUEST,
                    );
                }

                if (!this.isValidEmail(account.email)) {
                    throw new HttpException(
                        'Email không hợp lệ',
                        HttpStatus.BAD_REQUEST,
                    );
                }

                const generatedUsername = await this.generateUsername(
                    account.firstname,
                    account.lastname,
                );

                const randomPassword = this.generateRandomPassword(8);
                const hashedPassword = await this.hashPassword(randomPassword);

                const newAccount = this.accountRepository.create({
                    username: generatedUsername,
                    password: hashedPassword,
                    firstname: account.firstname,
                    lastname: account.lastname,
                    email: account.email,
                    gender: account.gender,
                    dateofbirth: formattedDate,
                    phonenumber: account.phonenumber,
                    role: checkRole,
                });

                const savedAccount =
                    await this.accountRepository.save(newAccount);
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
            } catch (error) {
                errors.push({
                    account,
                    message: error.message || 'Unknown error',
                });
            }
        }

        return {
            savedAccounts: plainToInstance(
                CreateAccountFromFileDTO,
                savedAccounts,
                {
                    excludeExtraneousValues: true,
                },
            ),
            errors,
        };
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

    async updateStatus(id: string, status: AccountStatus) {
        const account = await this.accountRepository.findOneBy({ id });

        if (!account) {
            throw new NotFoundException('Account is not found');
        }

        account.status = status;

        const updateAccount = await this.accountRepository.save(account);
        return updateAccount;
    }

    async searchByName(
        name: string,
        page: number,
        pageSize: number,
        sortOrder: 'ASC' | 'DESC' = 'ASC',
    ): Promise<{
        data: GetAccountDTO[];
        totalItems: number;
        totalPages: number;
        currentPage: number;
    }> {
        const skip = (page - 1) * pageSize;

        let accounts: any[], total: number;

        if (!name || name.trim() === '') {
            [accounts, total] = await this.accountRepository.findAndCount({
                skip: skip,
                relations: ['role'],
                take: pageSize,
                order: { createdat: sortOrder },
            });
        } else {
            [accounts, total] = await this.accountRepository.findAndCount({
                where: [
                    { firstname: ILike(`%${name}%`) },
                    { lastname: ILike(`%${name}%`) },
                ],
                relations: ['role'],
                skip: skip,
                take: pageSize,
                order: { createdat: sortOrder },
            });
        }

        const totalPages = Math.ceil(total / pageSize);

        const transformedAccounts = plainToInstance(GetAccountDTO, accounts, {
            excludeExtraneousValues: true,
        });

        return {
            data: transformedAccounts as GetAccountDTO[],
            totalItems: total,
            totalPages: totalPages,
            currentPage: page,
        };
    }
}
