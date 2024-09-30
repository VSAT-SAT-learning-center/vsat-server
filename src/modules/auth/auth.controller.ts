import {
    Body,
    Controller,
    HttpException,
    HttpStatus,
    Post,
    UseGuards,
} from '@nestjs/common';
import { AuthDTO } from './dto/auth.dto';
import { AuthService } from './auth.service';
import { AuthGuard } from '@nestjs/passport';
import { LocalGuard } from './guards/local.guard';

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

    @Post('refresh-token')
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
}
