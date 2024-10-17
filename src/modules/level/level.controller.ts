import { ResponseHelper } from 'src/common/helpers/response.helper';
import { GetLevelDTO } from './dto/get-level.dto';
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
import { ApiTags } from '@nestjs/swagger';
import { BaseController } from '../base/base.controller';
import { Level } from 'src/database/entities/level.entity';

@ApiTags('Level')
@Controller('level')
export class LevelController extends BaseController<Level> {
    constructor(private readonly levelService: LevelService) {
      super(levelService, 'Level'); // Pass service and entity name to BaseController
    }

    @Post()
    @UseGuards(JwtAuthGuard)
    async save(@Body() levelDto: GetLevelDTO, @Req() req) {
        try {
            const userId = req.user.id;
            const saveLevel = await this.levelService.save(levelDto, userId);
            return ResponseHelper.success(
                HttpStatus.CREATED,
                saveLevel,
                SuccessMessages.get('Level'),
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
    async updateLevel(
        @Param('id') id: string,
        @Body() levelDto: GetLevelDTO,
        @Req() req,
    ) {
        try {
            const userId = req.user.id;
            const updateLevel = await this.levelService.updateLevel(
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
