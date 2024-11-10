import {
    Body,
    Controller,
    Get,
    HttpException,
    HttpStatus,
    Post,
    Req,
    Request,
    UseGuards,
} from '@nestjs/common';
import { AuthDTO } from './dto/auth.dto';
import { AuthService } from './auth.service';
import { LocalGuard } from '../../common/guards/local.guard';
import { JwtAuthGuard } from '../../common/guards/jwt.guard';
import { MailerService } from '@nestjs-modules/mailer';
import { ApiTags } from '@nestjs/swagger';
import { RoleGuard } from 'src/common/guards/role.guard';
import { AuthGuard } from '@nestjs/passport';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) {}

    @Post('login')
    @UseGuards(LocalGuard)
    async login(@Request() req) {
        try {
            return this.authService.login(req.user);
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
            throw new HttpException('Refresh token is required', HttpStatus.BAD_REQUEST);
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
    async logout(@Request() req) {
        try {
            const userId = req.user['id'];

            const result = await this.authService.logout(userId);

            if (result) {
                return { message: 'Logout successful' };
            } else {
                throw new HttpException('Logout failed', HttpStatus.BAD_REQUEST);
            }
        } catch (error) {
            throw new HttpException(
                error.message || 'Logout failed',
                HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }

    @Post('test')
    @UseGuards(JwtAuthGuard, new RoleGuard(['staff']))
    async test(@Request() req) {
        return req.user;
    }
}
