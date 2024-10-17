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
} from '@nestjs/common';
import { CreateUnitAreaProgressDto } from './dto/create-unitareaprogress.dto';
import { UpdateUnitAreaProgressDto } from './dto/update-unitareaprogress.dto';
import { UnitAreaProgressService } from './unit-area-progress.service';
import { PaginationOptionsDto } from 'src/common/dto/pagination-options.dto.ts';
import { ResponseHelper } from 'src/common/helpers/response.helper';
import { ApiTags } from '@nestjs/swagger';
import { BaseController } from '../base/base.controller';
import { UnitAreaProgress } from 'src/database/entities/unitareaprogress.entity';
import { SuccessMessages } from 'src/common/constants/success-messages';

@ApiTags('UnitAreaProgress')
@Controller('unit-area-progress')
export class UnitAreaProgressController extends BaseController<UnitAreaProgress> {
    constructor(private readonly unitAreaProgressService: UnitAreaProgressService) {
        super(unitAreaProgressService, 'UnitAreaProgress');
    }

    @Get(':id')
    async findOne(@Param('id') id: string) {
        const unit = await this.unitAreaProgressService.findOne(id, [
            'lessonProgresses',
        ]);
        return ResponseHelper.success(
            HttpStatus.OK,
            unit,
            SuccessMessages.get('UnitAreaProgress'),
        );
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

    @Patch(':unitProgressId/:unitAreaId')
    async updateUnitAreaProgress(
        @Param('unitProgressId') unitProgressId: string,
        @Param('unitAreaId') unitAreaId: string,
    ): Promise<UnitAreaProgress> {
        return this.unitAreaProgressService.updateUnitAreaProgress(
            unitProgressId,
            unitAreaId,
        );
    }
}
