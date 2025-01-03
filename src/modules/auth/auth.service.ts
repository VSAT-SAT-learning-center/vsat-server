import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Account } from 'src/database/entities/account.entity';
import { Repository } from 'typeorm';
import { AuthDTO } from './dto/auth.dto';
import { JsonWebTokenError, JwtService } from '@nestjs/jwt';
import { MailerService } from '@nestjs-modules/mailer';
import * as bcrypt from 'bcrypt';
import { AccountStatus } from 'src/common/enums/account-status.enum';
import { StudyProfile } from 'src/database/entities/studyprofile.entity';
import { plainToInstance } from 'class-transformer';
import { GetAccountDTO } from '../account/dto/get-account.dto';
import { AccountDTO } from '../account/dto/account.dto';

@Injectable()
export class AuthService {
    constructor(
        @InjectRepository(Account)
        private readonly authRepository: Repository<Account>,
        @InjectRepository(StudyProfile)
        private readonly studyProfileRepository: Repository<StudyProfile>,
        private readonly jwtService: JwtService,
        private readonly mailerService: MailerService,
    ) {}

    async sendMail(email: string, activationToken: string) {
        const activationLink = `https://server.vsatcenter.edu.vn/account/activate?token=${activationToken}`;

        await this.mailerService.sendMail({
            to: email,
            subject: 'Activate Your Account',
            template: 'active',
            context: {
                activation_link: activationLink,
            },
        });

        return 'Activation email sent';
    }

    createAccessToken(account: any) {
        const payload = {
            id: account.id,
            email: account.email,
            role: account.role.rolename,
        };
        return this.jwtService.sign(payload, {
            secret: process.env.ACCESS_TOKEN_KEY,
            expiresIn: '7d',
        });
    }

    createRefreshToken(account: any) {
        const payload = { id: account.id, username: account.username };

        return this.jwtService.sign(payload, {
            secret: process.env.REFRESH_TOKEN_KEY,
            expiresIn: '7d',
        });
    }

    //login
    async login(user: any) {
        const findAcc = await this.authRepository.findOne({
            where: { email: user.email },
            relations: ['role'],
        });

        if (!findAcc) {
            throw new HttpException(
                'Wrong username or password',
                HttpStatus.UNAUTHORIZED,
            );
        }

        const accessToken = this.createAccessToken(findAcc);
        const refreshToken = this.createRefreshToken(findAcc);

        if (findAcc.refreshToken) {
            findAcc.refreshToken = null;
        }

        findAcc.refreshToken = refreshToken;
        await this.authRepository.save(findAcc);

        if (findAcc.status === AccountStatus.INACTIVE) {
            const activationToken = this.createAccessToken(findAcc);

            await this.sendMail(findAcc.email, activationToken);

            throw new HttpException(
                'The account is inactive. Please activate your account through the email link provided.',
                HttpStatus.BAD_REQUEST,
            );
        } else if (findAcc.status === AccountStatus.BANNED) {
            throw new HttpException('Account is not permission', HttpStatus.UNAUTHORIZED);
        }

        const account = plainToInstance(GetAccountDTO, findAcc, {
            excludeExtraneousValues: true,
        });

        return {
            accessToken,
            refreshToken,
            account,
        };
    }

    async validate({ username, password }: AuthDTO): Promise<any> {
        const findAcc = await this.authRepository.findOne({
            where: { email: username },
        });

        if (!findAcc) {
            throw new HttpException(
                'Wrong username or password',
                HttpStatus.UNAUTHORIZED,
            );
        }

        const isPasswordValid = await bcrypt.compare(password, findAcc.password);
        if (isPasswordValid) {
            return {
                id: findAcc.id,
                email: findAcc.email,
            };
        } else {
            throw new HttpException(
                'Wrong username or password',
                HttpStatus.UNAUTHORIZED,
            );
        }
    }

    async refreshAccessToken(refreshToken: string) {
        try {
            const decoded = this.jwtService.verify(refreshToken, {
                secret: process.env.REFRESH_TOKEN_KEY,
            });

            const findAcc = await this.authRepository.findOne({
                where: { id: decoded.id, username: decoded.username },
                relations: ['role'],
            });

            if (!findAcc) {
                throw new HttpException('User not found', HttpStatus.UNAUTHORIZED);
            }

            if (findAcc.refreshToken !== refreshToken) {
                throw new HttpException(
                    'Token expired or invalid',
                    HttpStatus.UNAUTHORIZED,
                );
            }

            const accessToken = this.createAccessToken({
                id: findAcc.id,
                username: findAcc.username,
                role: findAcc.role.rolename,
            });

            return {
                accessToken,
            };
        } catch (error) {
            if (
                error instanceof JsonWebTokenError &&
                error.message === 'invalid signature'
            ) {
                throw new HttpException(
                    'Invalid token signature',
                    HttpStatus.UNAUTHORIZED,
                );
            } else if (
                error instanceof JsonWebTokenError &&
                error.name === 'TokenExpiredError'
            ) {
                throw new HttpException('Token expired', HttpStatus.UNAUTHORIZED);
            } else {
                throw new HttpException(
                    'Invalid or expired token',
                    HttpStatus.UNAUTHORIZED,
                );
            }
        }
    }

    async logout(userId: string): Promise<boolean> {
        const user = await this.authRepository.findOne({
            where: { id: userId },
        });

        if (!user) {
            throw new HttpException('User not found', HttpStatus.NOT_FOUND);
        }

        user.refreshToken = null;
        await this.authRepository.save(user);

        return true;
    }

    async googleLogin(email: string) {
        const findAcc = await this.authRepository.findOne({
            where: { email: email },
            relations: ['role'],
        });

        if (!findAcc) {
            throw new HttpException('Email is not registered ', HttpStatus.UNAUTHORIZED);
        }

        const accessToken = this.createAccessToken(findAcc);
        const refreshToken = this.createRefreshToken(findAcc);

        if (findAcc.refreshToken) {
            findAcc.refreshToken = null;
        }

        findAcc.refreshToken = refreshToken;

        if (findAcc.status === AccountStatus.INACTIVE) {
            const activationToken = this.createAccessToken(findAcc);

            await this.sendMail(findAcc.email, activationToken);

            throw new HttpException(
                'The account is inactive. Please activate your account through the email link provided.',
                HttpStatus.BAD_REQUEST,
            );
        } else if (findAcc.status === AccountStatus.BANNED) {
            throw new HttpException('Account is not permission', HttpStatus.UNAUTHORIZED);
        }

        const account = plainToInstance(GetAccountDTO, findAcc, {
            excludeExtraneousValues: true,
        });

        return {
            accessToken,
            refreshToken,
            account,
        };
    }
}
