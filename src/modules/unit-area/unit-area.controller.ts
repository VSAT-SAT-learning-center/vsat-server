import {
    Controller,
    Get,
    Post,
    Body,
    Param,
    Patch,
    Delete,
    HttpStatus,
} from '@nestjs/common';
import { CreateUnitAreaDto } from './dto/create-unitarea.dto';
import { UpdateUnitAreaDto } from './dto/update-unitarea.dto';
import { UnitAreaService } from './unit-area.service';
import { SuccessMessages } from 'src/common/constants/success-messages';
import { ResponseHelper } from 'src/common/helpers/response.helper';
import { BaseController } from '../base/base.controller';
import { UnitArea } from 'src/database/entities/unitarea.entity';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('UnitAreas')
@Controller('unit-areas')
export class UnitAreaController extends BaseController<UnitArea> {
    constructor(private readonly unitAreaService: UnitAreaService) {
        super(unitAreaService, 'UnitArea');
    }

    @Post()
    async create(@Body() createUnitAreaDto: CreateUnitAreaDto) {
        try {
            const createdUnitArea =
                await this.unitAreaService.create(createUnitAreaDto);
            return ResponseHelper.success(
                HttpStatus.CREATED,
                createdUnitArea,
                SuccessMessages.create('UnitArea'),
            );
        } catch (error) {
            return ResponseHelper.error(
                error,
                HttpStatus.BAD_REQUEST,
                'Failed to create UnitArea',
            );
        }
    }

    @Patch(':id')
    async update(
        @Param('id') id: string,
        @Body() updateUnitAreaDto: UpdateUnitAreaDto,
    ) {
        try {
            const updatedUnitArea = await this.unitAreaService.update(
                id,
                updateUnitAreaDto,
            );
            return ResponseHelper.success(
                HttpStatus.OK,
                updatedUnitArea,
                SuccessMessages.update('UnitArea'),
            );
        } catch (error) {
            return ResponseHelper.error(
                error,
                HttpStatus.BAD_REQUEST,
                'Failed to update UnitArea',
            );
        }
    }
}
