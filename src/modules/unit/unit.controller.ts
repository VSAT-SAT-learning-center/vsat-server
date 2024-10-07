import {
    Controller,
    Get,
    Post,
    Body,
    Param,
    Patch,
    Delete,
    HttpStatus,
    Query,
} from '@nestjs/common';
import { UnitService } from './unit.service';
import { CreateUnitDto } from './dto/create-unit.dto';
import { UpdateUnitDto } from './dto/update-unit.dto'; // Import SuccessMessages
import { SuccessMessages } from 'src/common/constants/success-messages';
import { ResponseHelper } from 'src/common/helpers/response.helper';
import { ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';
import { PaginationOptionsDto } from 'src/common/dto/pagination-options.dto.ts';
import { BaseController } from '../base/base.controller';
import { Unit } from 'src/database/entities/unit.entity';

@ApiTags('Units')
@Controller('units')
export class UnitController extends BaseController<Unit> {
    constructor(private readonly unitService: UnitService) {
        super(unitService, 'Unit');
    }

    @Get(':id')
    async findOne(@Param('id') id: string) {
        try {
            const unit = await this.unitService.findOne(id, ['unitAreas']);
            return ResponseHelper.success(
                HttpStatus.OK,
                unit,
                SuccessMessages.get('Unit'),
            );
        } catch (error) {
            return ResponseHelper.error(
                error,
                HttpStatus.BAD_REQUEST,
                'Failed to get Unit',
            );
        }
    }

    @Post()
    async create(@Body() createUnitDto: CreateUnitDto) {
        try {
            const createdUnit = await this.unitService.create(createUnitDto);
            return ResponseHelper.success(
                HttpStatus.CREATED,
                createdUnit,
                SuccessMessages.create('Unit'),
            );
        } catch (error) {
            return ResponseHelper.error(
                error,
                HttpStatus.BAD_REQUEST,
                'Failed to create Unit',
            );
        }
    }

    @Patch(':id')
    async update(
        @Param('id') id: string,
        @Body() updateUnitDto: UpdateUnitDto,
    ) {
        try {
            const updatedUnit = await this.unitService.update(
                id,
                updateUnitDto,
            );
            return ResponseHelper.success(
                HttpStatus.OK,
                updatedUnit,
                SuccessMessages.update('Unit'),
            );
        } catch (error) {
            return ResponseHelper.error(
                error,
                HttpStatus.BAD_REQUEST,
                'Failed to update Unit',
            );
        }
    }
}
