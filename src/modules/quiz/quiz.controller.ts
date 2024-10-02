import { Controller, Get, Post, Body, Param, Delete, Query, Put, HttpStatus } from '@nestjs/common';
import { QuizService } from './quiz.service';
import { PaginationOptionsDto } from 'src/common/dto/pagination-options.dto.ts';
import { ResponseHelper } from 'src/common/helpers/response.helper';
import { UpdateQuizDto } from './dto/update-quiz.dto';
import { CreateQuizDto } from './dto/create-quiz.dto';

@Controller('quizzes')
export class QuizController {
  constructor(private readonly quizService: QuizService) {}

  @Get()
  async findAll(@Query() paginationOptions: PaginationOptionsDto) {
    try {
      const { data, totalItems, totalPages } = await this.quizService.findAll(paginationOptions);

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
        'Quizzes retrieved successfully',
        paging,
        sorting,
      );
    } catch (error) {
      return ResponseHelper.error(
        error,
        HttpStatus.INTERNAL_SERVER_ERROR,
        'Failed to retrieve quizzes',
      );
    }
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    try {
      const quiz = await this.quizService.findOne(id);
      if (!quiz) {
        return ResponseHelper.error(null, HttpStatus.NOT_FOUND, 'Quiz not found');
      }
      return ResponseHelper.success(HttpStatus.OK, quiz, 'Quiz retrieved successfully');
    } catch (error) {
      return ResponseHelper.error(
        error,
        HttpStatus.INTERNAL_SERVER_ERROR,
        'Failed to retrieve quiz',
      );
    }
  }

  @Post()
  async create(@Body() createQuizDto: CreateQuizDto) {
    try {
      const quiz = await this.quizService.create(createQuizDto);
      return ResponseHelper.success(HttpStatus.CREATED, quiz, 'Quiz created successfully');
    } catch (error) {
      return ResponseHelper.error(
        error,
        HttpStatus.BAD_REQUEST,
        'Failed to create quiz',
      );
    }
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() updateQuizDto: UpdateQuizDto) {
    try {
      const quiz = await this.quizService.update(id, updateQuizDto);
      return ResponseHelper.success(HttpStatus.OK, quiz, 'Quiz updated successfully');
    } catch (error) {
      return ResponseHelper.error(
        error,
        HttpStatus.BAD_REQUEST,
        'Failed to update quiz',
      );
    }
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    try {
      await this.quizService.remove(id);
      return ResponseHelper.success(HttpStatus.OK, null, 'Quiz deleted successfully');
    } catch (error) {
      return ResponseHelper.error(
        error,
        HttpStatus.INTERNAL_SERVER_ERROR,
        'Failed to delete quiz',
      );
    }
  }
}
