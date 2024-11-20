import {
    Controller,
    Get,
    Post,
    Body,
    Param,
    Delete,
    Query,
    Put,
    HttpStatus,
    Patch,
    HttpException,
} from '@nestjs/common';
import { CreateUnitAreaProgressDto } from './dto/create-unitareaprogress.dto';
import { UpdateUnitAreaProgressDto } from './dto/update-unitareaprogress.dto';
import { UnitAreaProgressService } from './unit-area-progress.service';
import { ResponseHelper } from 'src/common/helpers/response.helper';
import { ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { BaseController } from '../base/base.controller';
import { UnitAreaProgress } from 'src/database/entities/unitareaprogress.entity';
import { SuccessMessages } from 'src/common/constants/success-messages';

@ApiTags('UnitAreaProgress')
@Controller('unit-area-progress')
export class UnitAreaProgressController extends BaseController<UnitAreaProgress> {
    constructor(private readonly unitAreaProgressService: UnitAreaProgressService) {
        super(unitAreaProgressService, 'UnitAreaProgress');
    }

    @Post()
    async create(@Body() createUnitAreaProgressDto: CreateUnitAreaProgressDto) {
        const createdUnit = await this.unitAreaProgressService.create(
            createUnitAreaProgressDto,
        );
        return ResponseHelper.success(
            HttpStatus.CREATED,
            createdUnit,
            SuccessMessages.create('UnitAreaProgress'),
        );
    }

    @Patch(':id')
    async update(
        @Param('id') id: string,
        @Body() updateUnitAreaProgressDto: UpdateUnitAreaProgressDto,
    ) {
        const updatedUnitArea = await this.unitAreaProgressService.update(
            id,
            updateUnitAreaProgressDto,
        );
        return ResponseHelper.success(
            HttpStatus.OK,
            updatedUnitArea,
            SuccessMessages.update('UnitAreaProgress'),
        );
    }

    @Get(':unitAreaProgressId/details')
    @ApiParam({
        name: 'unitAreaProgressId',
        description: 'ID of the UnitAreaProgress',
    })
    @ApiOperation({ summary: 'Get UnitAreaProgress with content' })
    async getUnitAreaProgressDetails(
        @Param('unitAreaProgressId') unitAreaProgressId: string,
    ) {
        try {
            const result =
                await this.unitAreaProgressService.getUnitAreaProgressDetails(
                    unitAreaProgressId,
                );
            return ResponseHelper.success(
                HttpStatus.OK,
                result,
                'UnitAreaProgress details retrieved successfully',
            );
        } catch (error) {
            throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
        }
    }
}
