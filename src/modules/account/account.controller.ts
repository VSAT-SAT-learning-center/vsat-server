import {
    Body,
    Controller,
    Get,
    HttpException,
    HttpStatus,
    Post,
    Query,
    Req,
    Res,
    UseGuards,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Account } from 'src/database/entities/account.entity';
import { AccountService } from './account.service';
import { CreateAccountDTO } from './dto/create-account.dto';
import { ResponseHelper } from 'src/common/helpers/response.helper';
import { SuccessMessages } from 'src/common/constants/success-messages';
import { JwtAuthGuard } from 'src/common/guards/jwt.guard';
import { JwtService } from '@nestjs/jwt';
import { Response } from 'express';
import { ApiBody, ApiTags } from '@nestjs/swagger';
import { CreateAccountFromFileDTO } from './dto/create-account-file.dto';

@ApiTags('Accounts')
@Controller('account')
export class AccountController {
    constructor(
        private readonly accountService: AccountService,
        private readonly jwtService: JwtService,
    ) {}

    @Post()
    async save(@Body() accountDto: CreateAccountDTO) {
        try {
            const saveAccount = await this.accountService.save(accountDto);
            return ResponseHelper.success(
                HttpStatus.OK,
                saveAccount,
                SuccessMessages.create('Account'),
            );
        } catch (error) {
            throw new HttpException(
                {
                    statusCode: error.status || HttpStatus.BAD_REQUEST,
                    message: error.message || 'An error occurred',
                },
                error.status || HttpStatus.BAD_REQUEST,
            );
        }
    }

    @Post('createAccountFromFile')
    @ApiBody({ type: [CreateAccountFromFileDTO] })
    async createFromFile(
        @Body() createAccountFromFileDto: CreateAccountFromFileDTO[],
    ) {
        try {
            const saveAccount = await this.accountService.saveFromFile(
                createAccountFromFileDto,
            );
            return ResponseHelper.success(
                HttpStatus.OK,
                saveAccount,
                SuccessMessages.create('Account'),
            );
        } catch (error) {
            throw new HttpException(
                {
                    statusCode: error.status || HttpStatus.BAD_REQUEST,
                    message: error.message || 'An error occurred',
                },
                error.status || HttpStatus.BAD_REQUEST,
            );
        }
    }

    @Get('activate')
    async activateAccount(@Query('token') token: string, @Res() res: Response) {
        try {
            console.log('Received token:', token);
            const payload = this.jwtService.verify(token, {
                secret: process.env.ACCESS_TOKEN_KEY,
            });
            const userId = payload.id;

            this.accountService.active(userId);

            return res.redirect('https://www.youtube.com/');
        } catch (error) {
            throw new HttpException(
                {
                    statusCode: error.status || HttpStatus.BAD_REQUEST,
                    message: error.message || 'Invalid or expired token',
                },
                error.status || HttpStatus.BAD_REQUEST,
            );
        }
    }

    @Get()
    async find(
        @Query('page') page?: number,
        @Query('pageSize') pageSize?: number,
    ) {
        try {
            const account = await this.accountService.find(page, pageSize);
            return ResponseHelper.success(
                HttpStatus.OK,
                account,
                SuccessMessages.get('Account'),
            );
        } catch (error) {
            throw new HttpException(
                {
                    statusCode: error.status || HttpStatus.BAD_REQUEST,
                    message: error.message || 'Invalid or expired token',
                },
                error.status || HttpStatus.BAD_REQUEST,
            );
        }
    }
}
