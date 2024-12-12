import { HttpException, HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Account } from 'src/database/entities/account.entity';
import { ILike, Like, Not, Repository } from 'typeorm';
import { CreateAccountDTO } from './dto/create-account.dto';
import { plainToInstance } from 'class-transformer';
import * as bcrypt from 'bcrypt';
import { MailerService } from '@nestjs-modules/mailer';
import { Role } from 'src/database/entities/role.entity';
import { AccountStatus } from 'src/common/enums/account-status.enum';
import { CreateAccountFromFileDTO } from './dto/create-account-file.dto';
import { GetAccountDTO } from './dto/get-account.dto';
import { BaseService } from '../base/base.service';
import { StudyProfile } from 'src/database/entities/studyprofile.entity';
import { StudyProfileService } from '../study-profile/study-profile.service';
import { UpdateAccountDTO } from './dto/update-account.dto';
import { GetTecherDTO } from './dto/get-techer.dto';

@Injectable()
export class AccountService extends BaseService<Account> {
    constructor(
        @InjectRepository(Account)
        private readonly accountRepository: Repository<Account>,
        private readonly mailerService: MailerService,
        @InjectRepository(Role)
        private readonly roleRepository: Repository<Role>,
        @InjectRepository(StudyProfile)
        private readonly studyProfileRepository: Repository<StudyProfile>,

        private readonly studyProfileService: StudyProfileService,
    ) {
        super(accountRepository);
    }

    async generateUsername(firstname: string, lastname: string): Promise<string> {
        const baseUsername = firstname + lastname;
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
            throw new HttpException('Invalid email', HttpStatus.BAD_REQUEST);
        }

        if (email) {
            throw new HttpException(
                `Email: ${accountDTO.email} already exist`,
                HttpStatus.BAD_REQUEST,
            );
        }

        if (!role) {
            throw new NotFoundException(`Role ${accountDTO.role} does not exist`);
        }

        const generatedUsername = await this.generateUsername(
            accountDTO.firstname,
            accountDTO.lastname,
        );

        const randomPassword = this.generateRandomPassword(8);

        const hashedPassword = await this.hashPassword(randomPassword);

        let active = AccountStatus.INACTIVE;

        if (
            role.rolename === 'Staff' ||
            role.rolename === 'Manager' ||
            role.rolename === 'Admin'
        ) {
            active = AccountStatus.ACTIVE;
        }

        let imgUrl;
        if (role.rolename === 'Admin') {
            imgUrl = 'https://cdn-icons-png.flaticon.com/512/9703/9703596.png';
        }
        if (role.rolename === 'Manager') {
            imgUrl = 'https://cdn-icons-png.flaticon.com/512/2552/2552801.png';
        }
        if (role.rolename === 'Staff') {
            imgUrl = 'https://cdn-icons-png.flaticon.com/512/1535/1535835.png';
        }
        if (role.rolename === 'Teacher' && accountDTO.gender === true) {
            imgUrl = 'https://cdn-icons-png.flaticon.com/512/18174/18174185.png';
        }
        if (role.rolename === 'Teacher' && accountDTO.gender === false) {
            imgUrl = 'https://cdn-icons-png.flaticon.com/512/18174/18174175.png';
        }
        if (role.rolename === 'Student' && accountDTO.gender === true) {
            imgUrl = 'https://cdn-icons-png.flaticon.com/512/18174/18174163.png';
        }
        if (role.rolename === 'Student' && accountDTO.gender === false) {
            imgUrl = 'https://cdn-icons-png.flaticon.com/512/18174/18174160.png';
        }

        const account = await this.accountRepository.create({
            ...accountDTO,
            password: hashedPassword,
            username: generatedUsername,
            role: role,
            dateofbirth: formattedDate,
            status: active,
            profilepictureurl: imgUrl,
        });

        const saveAccount = await this.accountRepository.save(account);

        if (!saveAccount) {
            throw new HttpException('Fail to save account', HttpStatus.BAD_REQUEST);
        }

        if (saveAccount.role.rolename === 'Student') {
            await this.studyProfileService.create(saveAccount.id);
        }

        await this.sendWelComeMail(accountDTO.email, randomPassword, generatedUsername);

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
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
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
            template: 'welcome',
            context: {
                username: email,
                password: password,
            },
        });

        return 'Welcome email sent';
    }

    formatDateString(dateString: string): string {
        const [day, month, year] = dateString.split('/');
        return `${year}-${month}-${day}`;
    }

    async saveFromFile(createAccountFromFileDto: CreateAccountFromFileDTO[]): Promise<{
        savedAccounts: CreateAccountFromFileDTO[];
        errors: { account: CreateAccountFromFileDTO; message: string }[];
    }> {
        const savedAccounts: Account[] = [];
        const errors: { account: CreateAccountFromFileDTO; message: string }[] = [];
        let formattedDate: string | null = null;
        const emailSet = new Set<string>();

        for (const account of createAccountFromFileDto) {
            try {
                if (emailSet.has(account.email)) {
                    throw new HttpException(
                        `Duplicate email found: ${account.email}`,
                        HttpStatus.BAD_REQUEST,
                    );
                } else {
                    emailSet.add(account.email);
                }

                if (!account.firstname || account.firstname.trim() === '') {
                    throw new HttpException(
                        'First name cannot be empty',
                        HttpStatus.BAD_REQUEST,
                    );
                }

                if (!account.lastname || account.lastname.trim() === '') {
                    throw new HttpException(
                        'Last name cannot be empty',
                        HttpStatus.BAD_REQUEST,
                    );
                }

                if (!account.email || account.email.trim() === '') {
                    throw new HttpException(
                        'Email cannot be empty',
                        HttpStatus.BAD_REQUEST,
                    );
                }

                if (!account.dateofbirth || account.dateofbirth.trim() === '') {
                    throw new HttpException(
                        'Date of birth cannot be empty',
                        HttpStatus.BAD_REQUEST,
                    );
                }

                if (!account.phonenumber || account.phonenumber.trim() === '') {
                    throw new HttpException(
                        'Phone number cannot be empty',
                        HttpStatus.BAD_REQUEST,
                    );
                }

                if (!account.role || account.role.trim() === '') {
                    throw new HttpException(
                        'Role cannot be empty',
                        HttpStatus.BAD_REQUEST,
                    );
                }

                if (account.gender === undefined || account.gender === null) {
                    throw new HttpException(
                        'Gender cannot be empty',
                        HttpStatus.BAD_REQUEST,
                    );
                }

                const checkRole = await this.roleRepository.findOne({
                    where: { rolename: account.role },
                });

                if (!checkRole) {
                    throw new NotFoundException(`Role ${account.role} not found`);
                }

                const email = await this.accountRepository.findOne({
                    where: { email: account.email },
                });

                if (email) {
                    throw new HttpException(
                        'Email is already exsist',
                        HttpStatus.BAD_REQUEST,
                    );
                }

                if (account.dateofbirth) {
                    const datePattern = /^(\d{2})\/(\d{2})\/(\d{4})$/;
                    const match = account.dateofbirth.match(datePattern);

                    if (!match) {
                        throw new HttpException(
                            'Invalid date of birth format. Please use dd/MM/yyyy format.',
                            HttpStatus.BAD_REQUEST,
                        );
                    }

                    const day = parseInt(match[1], 10);
                    const month = parseInt(match[2], 10) - 1;
                    const year = parseInt(match[3], 10);

                    const date = new Date(Date.UTC(year, month, day));

                    formattedDate = `${year}-${(month + 1)
                        .toString()
                        .padStart(2, '0')}-${day.toString().padStart(2, '0')}`;

                    if (date > new Date()) {
                        throw new HttpException(
                            'Date of birth cannot be in the future',
                            HttpStatus.BAD_REQUEST,
                        );
                    }
                }

                if (!this.isValidEmail(account.email)) {
                    throw new HttpException('Email không hợp lệ', HttpStatus.BAD_REQUEST);
                }
            } catch (error) {
                errors.push({
                    account,
                    message: error.message || 'Unknown error',
                });
            }
        }

        if (errors.length > 0) {
            return {
                savedAccounts: [],
                errors,
            };
        }

        for (const account of createAccountFromFileDto) {
            try {
                const role = await this.roleRepository.findOne({
                    where: { rolename: account.role },
                });

                const generatedUsername = await this.generateUsername(
                    account.firstname,
                    account.lastname,
                );

                const randomPassword = this.generateRandomPassword(8);
                const hashedPassword = await this.hashPassword(randomPassword);

                let active = AccountStatus.INACTIVE;

                if (
                    role.rolename === 'Staff' ||
                    role.rolename === 'Manager' ||
                    role.rolename === 'Admin'
                ) {
                    active = AccountStatus.ACTIVE;
                }

                let imgUrl = null;
                if (role.rolename === 'Admin') {
                    imgUrl = 'https://cdn-icons-png.flaticon.com/512/9703/9703596.png';
                }
                if (role.rolename === 'Manager') {
                    imgUrl = 'https://cdn-icons-png.flaticon.com/512/2552/2552801.png';
                }
                if (role.rolename === 'Staff') {
                    imgUrl = 'https://cdn-icons-png.flaticon.com/512/1535/1535835.png';
                }
                if (role.rolename === 'Teacher' && account.gender === true) {
                    imgUrl = 'https://cdn-icons-png.flaticon.com/512/18174/18174185.png';
                }
                if (role.rolename === 'Teacher' && account.gender === false) {
                    imgUrl = 'https://cdn-icons-png.flaticon.com/512/18174/18174175.png';
                }
                if (role.rolename === 'Student' && account.gender === true) {
                    imgUrl = 'https://cdn-icons-png.flaticon.com/512/18174/18174163.png';
                }
                if (role.rolename === 'student' && account.gender === false) {
                    imgUrl = 'https://cdn-icons-png.flaticon.com/512/18174/18174160.png';
                }

                const newAccount = this.accountRepository.create({
                    username: generatedUsername,
                    password: hashedPassword,
                    firstname: account.firstname,
                    lastname: account.lastname,
                    email: account.email,
                    gender: account.gender,
                    dateofbirth: formattedDate,
                    phonenumber: account.phonenumber,
                    role: await this.roleRepository.findOne({
                        where: { rolename: account.role },
                    }),
                    status: active,
                    profilepictureurl: imgUrl,
                });

                const savedAccount = await this.accountRepository.save(newAccount);

                if (!savedAccount) {
                    throw new HttpException(
                        'Fail to save account',
                        HttpStatus.BAD_REQUEST,
                    );
                }

                if (savedAccount.role.rolename === 'Student') {
                    await this.studyProfileService.create(savedAccount.id);
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
            savedAccounts: plainToInstance(CreateAccountFromFileDTO, savedAccounts, {
                excludeExtraneousValues: true,
            }),
            errors,
        };
    }

    async find(page: number, pageSize: number): Promise<any> {
        const skip = (page - 1) * pageSize;

        const [accounts, total] = await this.accountRepository.findAndCount({
            relations: ['role'],
            where: { role: { rolename: Not('Admin') } },
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
                where: { role: { rolename: Not('Admin') } },
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

    async findManagers(): Promise<Account[]> {
        return await this.accountRepository.find({
            where: { role: { rolename: 'Manager' } },
        });
    }

    async changePassword(
        userId: string,
        currentPassword: string,
        newPassword: string,
    ): Promise<string> {
        const account = await this.accountRepository.findOneBy({ id: userId });
        if (!account) {
            throw new HttpException('User not found', HttpStatus.NOT_FOUND);
        }

        const isCurrentPasswordValid = await bcrypt.compare(
            currentPassword,
            account.password,
        );
        if (!isCurrentPasswordValid) {
            throw new HttpException(
                'Current password is incorrect',
                HttpStatus.FORBIDDEN,
            );
        }

        const hashedNewPassword = await this.hashPassword(newPassword);

        account.password = hashedNewPassword;
        await this.accountRepository.save(account);

        return 'Password updated successfully';
    }

    async findById(id: string): Promise<GetAccountDTO> {
        const account = await this.accountRepository.findOne({
            where: { id: id },
            relations: ['role'],
        });

        if (!account) {
            throw new NotFoundException('Account is not found');
        }

        return plainToInstance(GetAccountDTO, account, { excludeExtraneousValues: true });
    }

    async updateIsTrialExam(id: string, status: boolean) {
        const account = await this.accountRepository.findOne({
            where: { id: id },
            relations: ['role'],
        });

        if (!account) {
            throw new NotFoundException('Account is not found');
        }

        account.isTrialExam = status;

        const updateAccount = await this.accountRepository.save(account);
        return plainToInstance(GetAccountDTO, updateAccount, {
            excludeExtraneousValues: true,
        });
    }

    async updateAccount(updateAccount: UpdateAccountDTO, accountId: string) {
        const account = await this.accountRepository.findOne({
            where: { id: accountId },
        });

        if (!account) {
            throw new NotFoundException('Account is not found');
        }

        account.firstname = updateAccount.firstname;
        account.lastname = updateAccount.lastname;
        account.phonenumber = updateAccount.phoneNumber;

        const updateAcc = await this.accountRepository.save(account);
        return plainToInstance(GetAccountDTO, updateAcc, {
            excludeExtraneousValues: true,
        });
    }

    async getTeacher(page: number, pageSize: number) {
        const skip = (page - 1) * pageSize;

        const [teacher, total] = await this.accountRepository.findAndCount({
            skip: skip,
            take: pageSize,
            where: { role: { rolename: 'Teacher' } },
        });

        const totalPages = total / pageSize;

        return {
            data: plainToInstance(GetAccountDTO, teacher, {
                excludeExtraneousValues: true,
            }),
            totalPages: totalPages,
            currentPage: page,
            totalItems: total,
        };
    }

    async getTeacherAndCount(page: number, pageSize: number) {
        const skip = (page - 1) * pageSize;

        const [teachers, total] = await this.accountRepository.findAndCount({
            skip: skip,
            take: pageSize,
            where: { role: { rolename: 'Teacher' } },
        });

        const teachersWithTotalMember = await Promise.all(
            teachers.map(async (teacher) => {
                const totalMember = await this.studyProfileRepository.count({
                    where: { teacherId: teacher.id },
                });
                return {
                    ...teacher,
                    totalMember,
                };
            }),
        );

        const totalPages = Math.ceil(total / pageSize);

        return {
            data: plainToInstance(GetTecherDTO, teachersWithTotalMember, {
                excludeExtraneousValues: true,
            }),
            totalPages: totalPages,
            currentPage: page,
            totalItems: total,
        };
    }
}
