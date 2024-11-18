import { Body, Controller, Get, HttpStatus, Param, Patch, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { BaseController } from '../base/base.controller';
import { UnitProgress } from 'src/database/entities/unitprogress.entity';
import { UnitProgressService } from './unit-progress.service';
import { ResponseHelper } from 'src/common/helpers/response.helper';
import { SuccessMessages } from 'src/common/constants/success-messages';
import { CreateUnitProgressDto } from './dto/create-unitprogress.dto';
import { UpdateUnitProgressDto } from './dto/update-unitprogress.dto';

// @ApiTags('UnitProgress')
@Controller('unit-progress')
export class UnitProgressController extends BaseController<UnitProgress> {
    constructor(private readonly unitProgressService: UnitProgressService) {
        super(unitProgressService, 'UnitProgress');
    }

    @Get(':id')
    async findOne(@Param('id') id: string) {
        const unit = await this.unitProgressService.findOneById(id, [
            'unitAreaProgresses',
        ]);
        return ResponseHelper.success(
            HttpStatus.OK,
            unit,
            SuccessMessages.get('UnitProgress'),
        );
    }

    @Post()
    async create(@Body() createUnitProgressDto: CreateUnitProgressDto) {
        const createdUnit = await this.unitProgressService.create(createUnitProgressDto);
        return ResponseHelper.success(
            HttpStatus.CREATED,
            createdUnit,
            SuccessMessages.create('UnitProgress'),
        );
    }

    @Patch(':id')
    async update(
        @Param('id') id: string,
        @Body() updateUnitProgressDto: UpdateUnitProgressDto,
    ) {
        const updatedUnit = await this.unitProgressService.update(
            id,
            updateUnitProgressDto,
        );
        return ResponseHelper.success(
            HttpStatus.OK,
            updatedUnit,
            SuccessMessages.update('UnitProgress'),
        );
    }

    @Patch(':unitId/:targetLearningId')
    async updateUnitProgress(
        @Param('unitId') unitId: string,
        @Param('targetLearningId') targetLearningId: string,
    ): Promise<UnitProgress> {
        return this.unitProgressService.updateUnitProgress(unitId, targetLearningId);
    }

}
