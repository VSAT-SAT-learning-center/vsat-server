import {
    Body,
    Controller,
    Get,
    HttpException,
    HttpStatus,
    Param,
    Post,
    Put,
    Query,
    Request,
    Res,
    UseGuards,
    ValidationPipe,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ApiBody, ApiParam, ApiQuery, ApiTags } from '@nestjs/swagger';
import { Response } from 'express';
import { SuccessMessages } from 'src/common/constants/success-messages';
import { JwtAuthGuard } from 'src/common/guards/jwt.guard';
import { RoleGuard } from 'src/common/guards/role.guard';
import { ResponseHelper } from 'src/common/helpers/response.helper';
import { AccountService } from './account.service';
import { CreateAccountFromFileDTO } from './dto/create-account-file.dto';
import { CreateAccountDTO } from './dto/create-account.dto';
import { UpdateAccountStatusDTO } from './dto/update-account-status.dto';

@ApiTags('Accounts')
@Controller('account')
export class AccountController {
    constructor(
        private readonly accountService: AccountService,
        private readonly jwtService: JwtService,
    ) {}

    @Post()
    @UseGuards(JwtAuthGuard, new RoleGuard(['admin']))
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
    @UseGuards(JwtAuthGuard, new RoleGuard(['admin']))
    @ApiBody({ type: [CreateAccountFromFileDTO] })
    async createFromFile(
        @Body(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
        createAccountFromFileDto: CreateAccountFromFileDTO[],
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
            if (error.code === '23505') {
                throw new HttpException(
                    {
                        message: 'Email already exists. Please use a different email.',
                    },
                    HttpStatus.BAD_REQUEST,
                );
            } else {
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

    @Get('activate')
    async activateAccount(@Query('token') token: string, @Res() res: Response) {
        try {
            const payload = this.jwtService.verify(token, {
                secret: process.env.ACCESS_TOKEN_KEY,
            });
            const userId = payload.id;

            this.accountService.active(userId);

            return res.redirect('http://localhost:3000/');
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
    @UseGuards(JwtAuthGuard, new RoleGuard(['admin']))
    async find(@Query('page') page?: number, @Query('pageSize') pageSize?: number) {
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

    @Put('update-status/:id')
    @UseGuards(JwtAuthGuard, new RoleGuard(['admin']))
    @ApiParam({ name: 'id', type: String, description: 'Account ID' })
    @ApiBody({ type: UpdateAccountStatusDTO })
    async updateStatus(
        @Param('id') id: string,
        @Body() updateAccountStatusDTO: UpdateAccountStatusDTO,
    ) {
        try {
            const updatedAccount = await this.accountService.updateStatus(
                id,
                updateAccountStatusDTO.status,
            );
            return ResponseHelper.success(
                HttpStatus.OK,
                updatedAccount,
                `Account status updated successfully.`,
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

    @Get('/search')
    @UseGuards(JwtAuthGuard, new RoleGuard(['admin']))
    @ApiQuery({ name: 'name', required: false })
    @ApiQuery({ name: 'page', required: true })
    @ApiQuery({ name: 'pageSize', required: true })
    @ApiQuery({
        name: 'sortOrder',
        required: false,
        enum: ['ASC', 'DESC'],
        description: 'Sort order for createdat',
    })
    async searchByName(
        @Query('name') name: string,
        @Query('page') page: number = 1,
        @Query('pageSize') pageSize: number = 10,
        @Query('sortOrder') sortOrder: 'ASC' | 'DESC' = 'ASC',
    ) {
        try {
            const accounts = await this.accountService.searchByName(
                name,
                page,
                pageSize,
                sortOrder,
            );
            return ResponseHelper.success(
                HttpStatus.OK,
                accounts,
                `Search results for name: ${name}`,
            );
        } catch (error) {
            throw new HttpException(
                {
                    statusCode: HttpStatus.BAD_REQUEST,
                    message: 'An error occurred while searching',
                },
                HttpStatus.BAD_REQUEST,
            );
        }
    }

    @Post('changepassword')
    @UseGuards(JwtAuthGuard)
    async changePassword(
        @Request() req,
        @Body('currentPassword') currentPassword: string,
        @Body('newPassword') newPassword: string,
    ) {
        try {
            const saveAccount = await this.accountService.changePassword(
                req.user.id,
                currentPassword,
                newPassword,
            );
            return {
                statusCode: HttpStatus.OK,
                message: 'Password updated successfully',
                data: saveAccount,
            };
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

    @Post('getUserById')
    @UseGuards(JwtAuthGuard)
    async getAccountById(@Request() req) {
        try {
            const saveAccount = await this.accountService.findById(req.user.id);
            return {
                statusCode: HttpStatus.OK,
                message: 'Get User successfully',
                data: saveAccount,
            };
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
