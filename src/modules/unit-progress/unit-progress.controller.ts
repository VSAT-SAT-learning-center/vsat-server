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

import { SuccessMessages } from 'src/common/constants/success-messages';
import { ResponseHelper } from 'src/common/helpers/response.helper';
import { ApiTags } from '@nestjs/swagger';
import { PaginationOptionsDto } from 'src/common/dto/pagination-options.dto.ts';
import { UpdateUnitDto } from '../unit/dto/update-unit.dto';
import { CreateUnitDto } from '../unit/dto/create-unit.dto';
import { UnitService } from '../unit/unit.service';

@ApiTags('Unit')
@Controller('units')
export class UnitController {
    constructor(private readonly unitService: UnitService) {}

    @Post()
    async create(@Body() createUnitDto: CreateUnitDto) {
        const unit = await this.unitService.create(createUnitDto);
        return ResponseHelper.success(
            HttpStatus.CREATED,
            unit,
            SuccessMessages.create('Unit'),
        );
    }

    @Get()
    async findAll(@Query() paginationOptions: PaginationOptionsDto) {
        const { data, totalItems, totalPages } =
            await this.unitService.findAll(paginationOptions);

        const paging = {
            page: paginationOptions.page,
            pageSize: paginationOptions.pageSize,
            totalItems,
            totalPages,
        };

        const sorting = {
            sortBy: paginationOptions.sortBy,
            sortOrder: paginationOptions.sortOrder,
        };

        return ResponseHelper.success(
            HttpStatus.OK,
            data,
            SuccessMessages.gets('Units'),
            paging,
            sorting,
        );
    }

    @Get(':id')
    async findOne(@Param('id') id: string) {
        const unit = await this.unitService.findOne(id);
        if (!unit) {
            return ResponseHelper.error(
                null,
                HttpStatus.NOT_FOUND,
                'Unit not found',
            );
        }
        return ResponseHelper.success(
            HttpStatus.OK,
            unit,
            SuccessMessages.get('Unit'),
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

    @Delete(':id')
    async remove(@Param('id') id: string) {
        await this.unitService.remove(id);
        return ResponseHelper.success(
            HttpStatus.OK,
            null,
            SuccessMessages.delete('Unit'),
        );
    }
}
