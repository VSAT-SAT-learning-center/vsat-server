import {
    Body,
    Controller,
    Get,
    HttpException,
    HttpStatus,
    Post,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Account } from 'src/database/entities/account.entity';
import { AccountService } from './account.service';
import { AccountDTO } from './dto/account.dto';
import { ResponseHelper } from 'src/common/helpers/response.helper';
import { SuccessMessages } from 'src/common/constants/success-messages';

@Controller('account')
export class AccountController {
    constructor(
        @InjectRepository(Account)
        private readonly accountService: AccountService,
    ) {}

    @Post()
    async save(@Body() accountDto: AccountDTO) {
        try {
            const saveAccount = await this.accountService.save(accountDto);
            return ResponseHelper.success(
                HttpStatus.OK,
                saveAccount,
                SuccessMessages.create('Quiz Question'),
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
}
