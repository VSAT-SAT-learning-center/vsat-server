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
    Req,
    UseGuards,
} from '@nestjs/common';
import { SuccessMessages } from 'src/common/constants/success-messages';
import { JwtAuthGuard } from '../../common/guards/jwt.guard';
import { RolesGuard } from '../../common/guards/role.guard';

@Controller('level')
@UseGuards(JwtAuthGuard)
export class LevelController {
    constructor(private readonly levelService: LevelService) {}

    @Post()
    @UseGuards(JwtAuthGuard)
    async save(@Body() levelDto: LevelDTO, @Req() req) {
        try {
            const userId = req.user.id;
            const saveLevel = await this.levelService.save(levelDto, userId);
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
    @UseGuards(JwtAuthGuard)
    async update(
        @Param('id') id: string,
        @Body() levelDto: LevelDTO,
        @Req() req,
    ) {
        try {
            const userId = req.user.id;
            const updateLevel = await this.levelService.update(
                id,
                levelDto,
                userId,
            );
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
    @UseGuards(JwtAuthGuard)
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
