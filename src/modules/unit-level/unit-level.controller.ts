import { Controller, Get, Post, Body, Param, Delete, Query, Put, HttpStatus } from '@nestjs/common';
import { CreateUnitLevelDto } from './dto/create-unitlevel.dto';
import { UpdateUnitLevelDto } from './dto/update-unitlevel.dto';
import { UnitLevelService } from './unit-level.service';
import { PaginationOptionsDto } from 'src/common/dto/pagination-options.dto.ts';
import { ResponseHelper } from 'src/common/helpers/response.helper';

@Controller('unitlevels')
export class UnitLevelController {
  constructor(private readonly unitLevelService: UnitLevelService) {}

  @Get()
  async findAll(@Query() paginationOptions: PaginationOptionsDto) {
    const { data, totalItems, totalPages } = await this.unitLevelService.findAll(paginationOptions);

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
      'Unit levels retrieved successfully',
      paging,
      sorting,
    );
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const unitLevel = await this.unitLevelService.findOne(id);
    if (!unitLevel) {
      return ResponseHelper.error(null, HttpStatus.NOT_FOUND, 'Unit level not found');
    }
    return ResponseHelper.success(HttpStatus.OK, unitLevel, 'Unit level retrieved successfully');
  }

  @Post()
  async create(@Body() createUnitLevelDto: CreateUnitLevelDto) {
    const unitLevel = await this.unitLevelService.create(createUnitLevelDto);
    return ResponseHelper.success(HttpStatus.CREATED, unitLevel, 'Unit level created successfully');
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() updateUnitLevelDto: UpdateUnitLevelDto) {
    const unitLevel = await this.unitLevelService.update(id, updateUnitLevelDto);
    return ResponseHelper.success(HttpStatus.OK, unitLevel, 'Unit level updated successfully');
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    await this.unitLevelService.remove(id);
    return ResponseHelper.success(HttpStatus.OK, null, 'Unit level deleted successfully');
  }
}
