import { Controller, Get, Post, Body, Param, Delete, Query, Put, HttpStatus } from '@nestjs/common';
import { CreateLessonProgressDto } from './dto/create-lessonprogress.dto';
import { UpdateLessonProgressDto } from './dto/update-lessonprogress.dto';
import { LessonProgressService } from './lesson-progress.service';
import { PaginationOptionsDto } from 'src/common/dto/pagination-options.dto.ts';
import { ResponseHelper } from 'src/common/helpers/response.helper';

@Controller('lessonprogresses')
export class LessonProgressController {
  constructor(private readonly lessonProgressService: LessonProgressService) {}

  @Get()
  async findAll(@Query() paginationOptions: PaginationOptionsDto) {
    try {
      const { data, totalItems, totalPages } = await this.lessonProgressService.findAll(paginationOptions);

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
        'Lesson progresses retrieved successfully',
        paging,
        sorting,
      );
    } catch (error) {
      return ResponseHelper.error(
        error,
        HttpStatus.INTERNAL_SERVER_ERROR,
        'Failed to retrieve lesson progresses',
      );
    }
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    try {
      const lessonProgress = await this.lessonProgressService.findOne(id);
      if (!lessonProgress) {
        return ResponseHelper.error(null, HttpStatus.NOT_FOUND, 'Lesson progress not found');
      }
      return ResponseHelper.success(HttpStatus.OK, lessonProgress, 'Lesson progress retrieved successfully');
    } catch (error) {
      return ResponseHelper.error(
        error,
        HttpStatus.INTERNAL_SERVER_ERROR,
        'Failed to retrieve lesson progress',
      );
    }
  }

  @Post()
  async create(@Body() createLessonProgressDto: CreateLessonProgressDto) {
    try {
      const lessonProgress = await this.lessonProgressService.create(createLessonProgressDto);
      return ResponseHelper.success(HttpStatus.CREATED, lessonProgress, 'Lesson progress created successfully');
    } catch (error) {
      return ResponseHelper.error(
        error,
        HttpStatus.BAD_REQUEST,
        'Failed to create lesson progress',
      );
    }
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() updateLessonProgressDto: UpdateLessonProgressDto) {
    try {
      const lessonProgress = await this.lessonProgressService.update(id, updateLessonProgressDto);
      return ResponseHelper.success(HttpStatus.OK, lessonProgress, 'Lesson progress updated successfully');
    } catch (error) {
      return ResponseHelper.error(
        error,
        HttpStatus.BAD_REQUEST,
        'Failed to update lesson progress',
      );
    }
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    try {
      await this.lessonProgressService.remove(id);
      return ResponseHelper.success(HttpStatus.OK, null, 'Lesson progress deleted successfully');
    } catch (error) {
      return ResponseHelper.error(
        error,
        HttpStatus.INTERNAL_SERVER_ERROR,
        'Failed to delete lesson progress',
      );
    }
  }
}
