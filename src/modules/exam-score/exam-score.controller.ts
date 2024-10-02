import { Controller, Get, Post, Body, Param, Delete, Query, Put, HttpStatus } from '@nestjs/common';
import { ExamScoreService } from './exam-score.service';
import { PaginationOptionsDto } from 'src/common/dto/pagination-options.dto.ts';
import { ResponseHelper } from 'src/common/helpers/response.helper';
import { CreateExamScoreDto } from './dto/create-examscore.dto';
import { UpdateExamScoreDto } from './dto/update-examscore.dto';

@Controller('examscores')
export class ExamScoreController {
  constructor(private readonly examScoreService: ExamScoreService) {}

  @Get()
  async findAll(@Query() paginationOptions: PaginationOptionsDto) {
    try {
      const { data, totalItems, totalPages } = await this.examScoreService.findAll(paginationOptions);

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
        'Exam scores retrieved successfully',
        paging,
        sorting,
      );
    } catch (error) {
      return ResponseHelper.error(
        error,
        HttpStatus.INTERNAL_SERVER_ERROR,
        'Failed to retrieve exam scores',
      );
    }
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    try {
      const examScore = await this.examScoreService.findOne(id);
      if (!examScore) {
        return ResponseHelper.error(null, HttpStatus.NOT_FOUND, 'Exam score not found');
      }
      return ResponseHelper.success(HttpStatus.OK, examScore, 'Exam score retrieved successfully');
    } catch (error) {
      return ResponseHelper.error(
        error,
        HttpStatus.INTERNAL_SERVER_ERROR,
        'Failed to retrieve exam score',
      );
    }
  }

  @Post()
  async create(@Body() createExamScoreDto: CreateExamScoreDto) {
    try {
      const examScore = await this.examScoreService.create(createExamScoreDto);
      return ResponseHelper.success(HttpStatus.CREATED, examScore, 'Exam score created successfully');
    } catch (error) {
      return ResponseHelper.error(
        error,
        HttpStatus.BAD_REQUEST,
        'Failed to create exam score',
      );
    }
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() updateExamScoreDto: UpdateExamScoreDto) {
    try {
      const examScore = await this.examScoreService.update(id, updateExamScoreDto);
      return ResponseHelper.success(HttpStatus.OK, examScore, 'Exam score updated successfully');
    } catch (error) {
      return ResponseHelper.error(
        error,
        HttpStatus.BAD_REQUEST,
        'Failed to update exam score',
      );
    }
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    try {
      await this.examScoreService.remove(id);
      return ResponseHelper.success(HttpStatus.OK, null, 'Exam score deleted successfully');
    } catch (error) {
      return ResponseHelper.error(
        error,
        HttpStatus.INTERNAL_SERVER_ERROR,
        'Failed to delete exam score',
      );
    }
  }
}
