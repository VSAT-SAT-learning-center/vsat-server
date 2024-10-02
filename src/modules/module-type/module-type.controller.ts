import { Controller, Get, Post, Body, Param, Delete, Query, Put, HttpStatus } from '@nestjs/common';
import { CreateModuleTypeDto } from './dto/create-moduletype.dto';
import { UpdateModuleTypeDto } from './dto/update-moduletype.dto';
import { ModuleTypeService } from './module-type.service';
import { PaginationOptionsDto } from 'src/common/dto/pagination-options.dto.ts';
import { ResponseHelper } from 'src/common/helpers/response.helper';

@Controller('moduletypes')
export class ModuleTypeController {
  constructor(private readonly moduleTypeService: ModuleTypeService) {}

  @Get()
  async findAll(@Query() paginationOptions: PaginationOptionsDto) {
    try {
      const { data, totalItems, totalPages } = await this.moduleTypeService.findAll(paginationOptions);

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
        'Module types retrieved successfully',
        paging,
        sorting,
      );
    } catch (error) {
      return ResponseHelper.error(
        error,
        HttpStatus.INTERNAL_SERVER_ERROR,
        'Failed to retrieve module types',
      );
    }
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    try {
      const moduleType = await this.moduleTypeService.findOne(id);
      if (!moduleType) {
        return ResponseHelper.error(null, HttpStatus.NOT_FOUND, 'Module type not found');
      }
      return ResponseHelper.success(HttpStatus.OK, moduleType, 'Module type retrieved successfully');
    } catch (error) {
      return ResponseHelper.error(
        error,
        HttpStatus.INTERNAL_SERVER_ERROR,
        'Failed to retrieve module type',
      );
    }
  }

  @Post()
  async create(@Body() createModuleTypeDto: CreateModuleTypeDto) {
    try {
      const moduleType = await this.moduleTypeService.create(createModuleTypeDto);
      return ResponseHelper.success(HttpStatus.CREATED, moduleType, 'Module type created successfully');
    } catch (error) {
      return ResponseHelper.error(
        error,
        HttpStatus.BAD_REQUEST,
        'Failed to create module type',
      );
    }
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() updateModuleTypeDto: UpdateModuleTypeDto) {
    try {
      const moduleType = await this.moduleTypeService.update(id, updateModuleTypeDto);
      return ResponseHelper.success(HttpStatus.OK, moduleType, 'Module type updated successfully');
    } catch (error) {
      return ResponseHelper.error(
        error,
        HttpStatus.BAD_REQUEST,
        'Failed to update module type',
      );
    }
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    try {
      await this.moduleTypeService.remove(id);
      return ResponseHelper.success(HttpStatus.OK, null, 'Module type deleted successfully');
    } catch (error) {
      return ResponseHelper.error(
        error,
        HttpStatus.INTERNAL_SERVER_ERROR,
        'Failed to delete module type',
      );
    }
  }
}
