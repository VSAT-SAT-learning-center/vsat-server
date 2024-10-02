import { Controller, Get, Post, Body, Param, Delete, Query, Put, HttpStatus } from '@nestjs/common';
import { CreateTargetLearningDto } from './dto/create-targetlearning.dto';
import { UpdateTargetLearningDto } from './dto/update-targetlearning.dto';
import { TargetLearningService } from './target-learning.service';
import { PaginationOptionsDto } from 'src/common/dto/pagination-options.dto.ts';
import { ResponseHelper } from 'src/common/helpers/response.helper';

@Controller('targetlearnings')
export class TargetLearningController {
  constructor(private readonly targetLearningService: TargetLearningService) {}

  @Get()
  async findAll(@Query() paginationOptions: PaginationOptionsDto) {
    try {
      const { data, totalItems, totalPages } = await this.targetLearningService.findAll(paginationOptions);

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
        'Target learnings retrieved successfully',
        paging,
        sorting,
      );
    } catch (error) {
      return ResponseHelper.error(
        error,
        HttpStatus.INTERNAL_SERVER_ERROR,
        'Failed to retrieve target learnings',
      );
    }
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    try {
      const targetLearning = await this.targetLearningService.findOne(id);
      if (!targetLearning) {
        return ResponseHelper.error(null, HttpStatus.NOT_FOUND, 'Target learning not found');
      }
      return ResponseHelper.success(HttpStatus.OK, targetLearning, 'Target learning retrieved successfully');
    } catch (error) {
      return ResponseHelper.error(
        error,
        HttpStatus.INTERNAL_SERVER_ERROR,
        'Failed to retrieve target learning',
      );
    }
  }

  @Post()
  async create(@Body() createTargetLearningDto: CreateTargetLearningDto) {
    try {
      const targetLearning = await this.targetLearningService.create(createTargetLearningDto);
      return ResponseHelper.success(HttpStatus.CREATED, targetLearning, 'Target learning created successfully');
    } catch (error) {
      return ResponseHelper.error(
        error,
        HttpStatus.BAD_REQUEST,
        'Failed to create target learning',
      );
    }
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() updateTargetLearningDto: UpdateTargetLearningDto) {
    try {
      const targetLearning = await this.targetLearningService.update(id, updateTargetLearningDto);
      return ResponseHelper.success(HttpStatus.OK, targetLearning, 'Target learning updated successfully');
    } catch (error) {
      return ResponseHelper.error(
        error,
        HttpStatus.BAD_REQUEST,
        'Failed to update target learning',
      );
    }
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    try {
      await this.targetLearningService.remove(id);
      return ResponseHelper.success(HttpStatus.OK, null, 'Target learning deleted successfully');
    } catch (error) {
      return ResponseHelper.error(
        error,
        HttpStatus.INTERNAL_SERVER_ERROR,
        'Failed to delete target learning',
      );
    }
  }
}
