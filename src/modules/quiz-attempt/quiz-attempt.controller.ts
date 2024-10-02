import { Controller, Get, Post, Body, Param, Delete, Query, Put, HttpStatus } from '@nestjs/common';
import { CreateQuizAttemptDto } from './dto/create-quizattempt.dto';
import { UpdateQuizAttemptDto } from './dto/update-quizattempt.dto';
import { QuizAttemptService } from './quiz-attempt.service';
import { PaginationOptionsDto } from 'src/common/dto/pagination-options.dto.ts';
import { ResponseHelper } from 'src/common/helpers/response.helper';

@Controller('quizattempts')
export class QuizAttemptController {
  constructor(private readonly quizAttemptService: QuizAttemptService) {}

  @Get()
  async findAll(@Query() paginationOptions: PaginationOptionsDto) {
    try {
      const { data, totalItems, totalPages } = await this.quizAttemptService.findAll(paginationOptions);

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
        'Quiz attempts retrieved successfully',
        paging,
        sorting,
      );
    } catch (error) {
      return ResponseHelper.error(
        error,
        HttpStatus.INTERNAL_SERVER_ERROR,
        'Failed to retrieve quiz attempts',
      );
    }
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    try {
      const quizAttempt = await this.quizAttemptService.findOne(id);
      if (!quizAttempt) {
        return ResponseHelper.error(null, HttpStatus.NOT_FOUND, 'Quiz attempt not found');
      }
      return ResponseHelper.success(HttpStatus.OK, quizAttempt, 'Quiz attempt retrieved successfully');
    } catch (error) {
      return ResponseHelper.error(
        error,
        HttpStatus.INTERNAL_SERVER_ERROR,
        'Failed to retrieve quiz attempt',
      );
    }
  }

  @Post()
  async create(@Body() createQuizAttemptDto: CreateQuizAttemptDto) {
    try {
      const quizAttempt = await this.quizAttemptService.create(createQuizAttemptDto);
      return ResponseHelper.success(HttpStatus.CREATED, quizAttempt, 'Quiz attempt created successfully');
    } catch (error) {
      return ResponseHelper.error(
        error,
        HttpStatus.BAD_REQUEST,
        'Failed to create quiz attempt',
      );
    }
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() updateQuizAttemptDto: UpdateQuizAttemptDto) {
    try {
      const quizAttempt = await this.quizAttemptService.update(id, updateQuizAttemptDto);
      return ResponseHelper.success(HttpStatus.OK, quizAttempt, 'Quiz attempt updated successfully');
    } catch (error) {
      return ResponseHelper.error(
        error,
        HttpStatus.BAD_REQUEST,
        'Failed to update quiz attempt',
      );
    }
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    try {
      await this.quizAttemptService.remove(id);
      return ResponseHelper.success(HttpStatus.OK, null, 'Quiz attempt deleted successfully');
    } catch (error) {
      return ResponseHelper.error(
        error,
        HttpStatus.INTERNAL_SERVER_ERROR,
        'Failed to delete quiz attempt',
      );
    }
  }
}
