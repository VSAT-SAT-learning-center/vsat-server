import { Controller, Get, Post, Body, Param, Delete, Query, Put, HttpStatus } from '@nestjs/common';
import { CreateQuizAttemptSkillDto } from './dto/create-quizattemptskill.dto';
import { UpdateQuizAttemptSkillDto } from './dto/update-quizattemptskill.dto';
import { QuizAttemptSkillService } from './quiz-attempt-skill.service';
import { PaginationOptionsDto } from 'src/common/dto/pagination-options.dto.ts';
import { ResponseHelper } from 'src/common/helpers/response.helper';

@Controller('quizattemptskills')
export class QuizAttemptSkillController {
  constructor(private readonly quizAttemptSkillService: QuizAttemptSkillService) {}

  @Get()
  async findAll(@Query() paginationOptions: PaginationOptionsDto) {
    try {
      const { data, totalItems, totalPages } = await this.quizAttemptSkillService.findAll(paginationOptions);

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
        'Quiz attempt skills retrieved successfully',
        paging,
        sorting,
      );
    } catch (error) {
      return ResponseHelper.error(
        error,
        HttpStatus.INTERNAL_SERVER_ERROR,
        'Failed to retrieve quiz attempt skills',
      );
    }
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    try {
      const quizAttemptSkill = await this.quizAttemptSkillService.findOne(id);
      if (!quizAttemptSkill) {
        return ResponseHelper.error(null, HttpStatus.NOT_FOUND, 'Quiz attempt skill not found');
      }
      return ResponseHelper.success(HttpStatus.OK, quizAttemptSkill, 'Quiz attempt skill retrieved successfully');
    } catch (error) {
      return ResponseHelper.error(
        error,
        HttpStatus.INTERNAL_SERVER_ERROR,
        'Failed to retrieve quiz attempt skill',
      );
    }
  }

  @Post()
  async create(@Body() createQuizAttemptSkillDto: CreateQuizAttemptSkillDto) {
    try {
      const quizAttemptSkill = await this.quizAttemptSkillService.create(createQuizAttemptSkillDto);
      return ResponseHelper.success(HttpStatus.CREATED, quizAttemptSkill, 'Quiz attempt skill created successfully');
    } catch (error) {
      return ResponseHelper.error(
        error,
        HttpStatus.BAD_REQUEST,
        'Failed to create quiz attempt skill',
      );
    }
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() updateQuizAttemptSkillDto: UpdateQuizAttemptSkillDto) {
    try {
      const quizAttemptSkill = await this.quizAttemptSkillService.update(id, updateQuizAttemptSkillDto);
      return ResponseHelper.success(HttpStatus.OK, quizAttemptSkill, 'Quiz attempt skill updated successfully');
    } catch (error) {
      return ResponseHelper.error(
        error,
        HttpStatus.BAD_REQUEST,
        'Failed to update quiz attempt skill',
      );
    }
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    try {
      await this.quizAttemptSkillService.remove(id);
      return ResponseHelper.success(HttpStatus.OK, null, 'Quiz attempt skill deleted successfully');
    } catch (error) {
      return ResponseHelper.error(
        error,
        HttpStatus.INTERNAL_SERVER_ERROR,
        'Failed to delete quiz attempt skill',
      );
    }
  }
}
