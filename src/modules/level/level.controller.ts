import { ResponseHelper } from 'src/common/helpers/response.helper';
import { LevelDTO } from './dto/level.dto';
import { LevelService } from './level.service';
import {
    Body,
    Controller,
    Get,
    HttpException,
    HttpStatus,
    Param,
    Post,
    Put,
    UseGuards,
} from '@nestjs/common';
import { SuccessMessages } from 'src/common/constants/success-messages';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';
import { RolesGuard } from '../auth/guards/role.guard';

@Controller('level')
export class LevelController {
    constructor(private readonly levelService: LevelService) {}

    @Post()
    async save(@Body() levelDto: LevelDTO) {
        try {
            const saveLevel = await this.levelService.save(levelDto);
            return ResponseHelper.success(
                HttpStatus.CREATED,
                saveLevel,
                SuccessMessages.create('Level'),
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

    @Put(':id')
    async update(@Param('id') id: string, @Body() levelDto: LevelDTO) {
        try {
            const updateLevel = await this.levelService.update(id, levelDto);
            return {
                statusCode: 200,
                message: 'Success',
                data: updateLevel,
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

    @Get()
    @UseGuards(JwtAuthGuard, RolesGuard)
    async find() {
        try {
            const level = await this.levelService.find();
            return ResponseHelper.success(
                HttpStatus.OK,
                level,
                SuccessMessages.create('Level'),
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

    @Get(':id')
    async findById(@Param('id') id: string) {
        try {
            const level = await this.levelService.findById(id);
            return ResponseHelper.success(
                HttpStatus.OK,
                level,
                SuccessMessages.create('Level'),
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
