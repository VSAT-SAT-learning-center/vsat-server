import {
    Controller,
    Get,
    Post,
    Body,
    Param,
    Patch,
    HttpStatus,
} from '@nestjs/common';
import { UnitService } from './unit.service';
import { CreateUnitDto } from './dto/create-unit.dto';
import { UpdateUnitDto } from './dto/update-unit.dto'; // Import SuccessMessages
import { SuccessMessages } from 'src/common/constants/success-messages';
import { ResponseHelper } from 'src/common/helpers/response.helper';
import { BaseController } from '../base/base.controller';
import { Unit } from 'src/database/entities/unit.entity';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Units')
@Controller('units')
export class UnitController extends BaseController<Unit> {
    constructor(private readonly unitService: UnitService) {
        super(unitService, 'Unit');
    }

    @Get(':id')
    async findOne(@Param('id') id: string) {
        const unit = await this.unitService.findOne(id, ['unitAreas']);
        return ResponseHelper.success(
            HttpStatus.OK,
            unit,
            SuccessMessages.get('Unit'),
        );
    }

    @Post()
    async create(@Body() createUnitDto: CreateUnitDto) {
        const createdUnit = await this.unitService.create(createUnitDto);
        return ResponseHelper.success(
            HttpStatus.CREATED,
            createdUnit,
            SuccessMessages.create('Unit'),
        );
    }

    @Patch(':id')
    async update(
        @Param('id') id: string,
        @Body() updateUnitDto: UpdateUnitDto,
    ) {
        const updatedUnit = await this.unitService.update(id, updateUnitDto);
        return ResponseHelper.success(
            HttpStatus.OK,
            updatedUnit,
            SuccessMessages.update('Unit'),
        );
    }

    @Patch(':id')
    async updateUnit(
        @Param('id') id: string,
        @Body() updateUnitStatusDto: UpdateUnitDto,
    ) {
        const updatedLessonContent = await this.unitService.updateUnitStatus(
            id,
            updateUnitStatusDto,
        );
        return ResponseHelper.success(
            HttpStatus.OK,
            updatedLessonContent,
            SuccessMessages.update('Unit'),
        );
    }
}
