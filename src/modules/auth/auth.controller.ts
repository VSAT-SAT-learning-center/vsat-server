import {
    Body,
    Controller,
    HttpException,
    HttpStatus,
    Post,
    Req,
    UseGuards,
} from '@nestjs/common';
import { AuthDTO } from './dto/auth.dto';
import { AuthService } from './auth.service';
import { LocalGuard } from '../../common/guards/local.guard';
import { Request } from 'express';
import { JwtAuthGuard } from '../../common/guards/jwt.guard';

@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) {}

    @Post('login')
    @UseGuards(LocalGuard)
    async login(@Body() authDto: AuthDTO) {
        try {
            return this.authService.validateAccount(authDto);
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

    @Post('refreshToken')
    async refreshToken(@Body('refreshToken') refreshToken: string) {
        if (!refreshToken) {
            throw new HttpException(
                'Refresh token is required',
                HttpStatus.BAD_REQUEST,
            );
        }

        try {
            return this.authService.refreshAccessToken(refreshToken);
        } catch (error) {
            throw new HttpException(
                {
                    statusCode: error.status || HttpStatus.UNAUTHORIZED,
                    message: 'Invalid or expired refresh token',
                },
                HttpStatus.UNAUTHORIZED,
            );
        }
    }

    @Post('logout')
    @UseGuards(JwtAuthGuard)
    async logout(@Req() req: Request) {
        try {
            const userId = req.user['id'];

            console.log(userId);

            const result = await this.authService.logout(userId);

            if (result) {
                return { message: 'Logout successful' };
            } else {
                throw new HttpException(
                    'Logout failed',
                    HttpStatus.BAD_REQUEST,
                );
            }
        } catch (error) {
            throw new HttpException(
                error.message || 'Logout failed',
                HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }
}
