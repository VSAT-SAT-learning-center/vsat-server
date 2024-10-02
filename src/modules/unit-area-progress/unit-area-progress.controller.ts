import { Controller, Get, Post, Body, Param, Delete, Query, Put, HttpStatus } from '@nestjs/common';
import { CreateUnitAreaProgressDto } from './dto/create-unitareaprogress.dto';
import { UpdateUnitAreaProgressDto } from './dto/update-unitareaprogress.dto';
import { UnitAreaProgressService } from './unit-area-progress.service';
import { PaginationOptionsDto } from 'src/common/dto/pagination-options.dto.ts';
import { ResponseHelper } from 'src/common/helpers/response.helper';

@Controller('unitareaprogresses')
export class UnitAreaProgressController {
  constructor(private readonly unitAreaProgressService: UnitAreaProgressService) {}

  @Get()
  async findAll(@Query() paginationOptions: PaginationOptionsDto) {
    try {
      const { data, totalItems, totalPages } = await this.unitAreaProgressService.findAll(paginationOptions);

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
        'Unit area progresses retrieved successfully',
        paging,
        sorting,
      );
    } catch (error) {
      return ResponseHelper.error(
        error,
        HttpStatus.INTERNAL_SERVER_ERROR,
        'Failed to retrieve unit area progresses',
      );
    }
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    try {
      const unitAreaProgress = await this.unitAreaProgressService.findOne(id);
      if (!unitAreaProgress) {
        return ResponseHelper.error(null, HttpStatus.NOT_FOUND, 'Unit area progress not found');
      }
      return ResponseHelper.success(HttpStatus.OK, unitAreaProgress, 'Unit area progress retrieved successfully');
    } catch (error) {
      return ResponseHelper.error(
        error,
        HttpStatus.INTERNAL_SERVER_ERROR,
        'Failed to retrieve unit area progress',
      );
    }
  }

  @Post()
  async create(@Body() createUnitAreaProgressDto: CreateUnitAreaProgressDto) {
    try {
      const unitAreaProgress = await this.unitAreaProgressService.create(createUnitAreaProgressDto);
      return ResponseHelper.success(HttpStatus.CREATED, unitAreaProgress, 'Unit area progress created successfully');
    } catch (error) {
      return ResponseHelper.error(
        error,
        HttpStatus.BAD_REQUEST,
        'Failed to create unit area progress',
      );
    }
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() updateUnitAreaProgressDto: UpdateUnitAreaProgressDto) {
    try {
      const unitAreaProgress = await this.unitAreaProgressService.update(id, updateUnitAreaProgressDto);
      return ResponseHelper.success(HttpStatus.OK, unitAreaProgress, 'Unit area progress updated successfully');
    } catch (error) {
      return ResponseHelper.error(
        error,
        HttpStatus.BAD_REQUEST,
        'Failed to update unit area progress',
      );
    }
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    try {
      await this.unitAreaProgressService.remove(id);
      return ResponseHelper.success(HttpStatus.OK, null, 'Unit area progress deleted successfully');
    } catch (error) {
      return ResponseHelper.error(
        error,
        HttpStatus.INTERNAL_SERVER_ERROR,
        'Failed to delete unit area progress',
      );
    }
  }
}
