import { Controller, Get, Post, Body, Param, Delete, Query, Put, HttpStatus } from '@nestjs/common';
import { CreateQuizAttemptAnswerDto } from './dto/create-quizattemptanswer.dto';
import { UpdateQuizAttemptAnswerDto } from './dto/update-quizattemptanswer.dto';
import { QuizAttemptAnswerService } from './quiz-attempt-answer.service';
import { PaginationOptionsDto } from 'src/common/dto/pagination-options.dto.ts';
import { ResponseHelper } from 'src/common/helpers/response.helper';

@Controller('quizattemptanswers')
export class QuizAttemptAnswerController {
  constructor(private readonly quizAttemptAnswerService: QuizAttemptAnswerService) {}

  @Get()
  async findAll(@Query() paginationOptions: PaginationOptionsDto) {
    try {
      const { data, totalItems, totalPages } = await this.quizAttemptAnswerService.findAll(paginationOptions);

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
        'Quiz attempt answers retrieved successfully',
        paging,
        sorting,
      );
    } catch (error) {
      return ResponseHelper.error(
        error,
        HttpStatus.INTERNAL_SERVER_ERROR,
        'Failed to retrieve quiz attempt answers',
      );
    }
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    try {
      const quizAttemptAnswer = await this.quizAttemptAnswerService.findOne(id);
      if (!quizAttemptAnswer) {
        return ResponseHelper.error(null, HttpStatus.NOT_FOUND, 'Quiz attempt answer not found');
      }
      return ResponseHelper.success(HttpStatus.OK, quizAttemptAnswer, 'Quiz attempt answer retrieved successfully');
    } catch (error) {
      return ResponseHelper.error(
        error,
        HttpStatus.INTERNAL_SERVER_ERROR,
        'Failed to retrieve quiz attempt answer',
      );
    }
  }

  @Post()
  async create(@Body() createQuizAttemptAnswerDto: CreateQuizAttemptAnswerDto) {
    try {
      const quizAttemptAnswer = await this.quizAttemptAnswerService.create(createQuizAttemptAnswerDto);
      return ResponseHelper.success(HttpStatus.CREATED, quizAttemptAnswer, 'Quiz attempt answer created successfully');
    } catch (error) {
      return ResponseHelper.error(
        error,
        HttpStatus.BAD_REQUEST,
        'Failed to create quiz attempt answer',
      );
    }
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() updateQuizAttemptAnswerDto: UpdateQuizAttemptAnswerDto) {
    try {
      const quizAttemptAnswer = await this.quizAttemptAnswerService.update(id, updateQuizAttemptAnswerDto);
      return ResponseHelper.success(HttpStatus.OK, quizAttemptAnswer, 'Quiz attempt answer updated successfully');
    } catch (error) {
      return ResponseHelper.error(
        error,
        HttpStatus.BAD_REQUEST,
        'Failed to update quiz attempt answer',
      );
    }
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    try {
      await this.quizAttemptAnswerService.remove(id);
      return ResponseHelper.success(HttpStatus.OK, null, 'Quiz attempt answer deleted successfully');
    } catch (error) {
      return ResponseHelper.error(
        error,
        HttpStatus.INTERNAL_SERVER_ERROR,
        'Failed to delete quiz attempt answer',
      );
    }
  }
}
