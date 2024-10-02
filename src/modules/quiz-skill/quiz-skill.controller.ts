import { Controller, Get, Post, Body, Param, Delete, Query, Put, HttpStatus } from '@nestjs/common';
import { CreateQuizSkillDto } from './dto/create-quizskill.dto';
import { UpdateQuizSkillDto } from './dto/update-quizskill.dto';
import { QuizSkillService } from './quiz-skill.service';
import { PaginationOptionsDto } from 'src/common/dto/pagination-options.dto.ts';
import { ResponseHelper } from 'src/common/helpers/response.helper';

@Controller('quizskills')
export class QuizSkillController {
  constructor(private readonly quizSkillService: QuizSkillService) {}

  @Get()
  async findAll(@Query() paginationOptions: PaginationOptionsDto) {
    try {
      const { data, totalItems, totalPages } = await this.quizSkillService.findAll(paginationOptions);

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
        'Quiz skills retrieved successfully',
        paging,
        sorting,
      );
    } catch (error) {
      return ResponseHelper.error(
        error,
        HttpStatus.INTERNAL_SERVER_ERROR,
        'Failed to retrieve quiz skills',
      );
    }
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    try {
      const quizSkill = await this.quizSkillService.findOne(id);
      if (!quizSkill) {
        return ResponseHelper.error(null, HttpStatus.NOT_FOUND, 'Quiz skill not found');
      }
      return ResponseHelper.success(HttpStatus.OK, quizSkill, 'Quiz skill retrieved successfully');
    } catch (error) {
      return ResponseHelper.error(
        error,
        HttpStatus.INTERNAL_SERVER_ERROR,
        'Failed to retrieve quiz skill',
      );
    }
  }

  @Post()
  async create(@Body() createQuizSkillDto: CreateQuizSkillDto) {
    try {
      const quizSkill = await this.quizSkillService.create(createQuizSkillDto);
      return ResponseHelper.success(HttpStatus.CREATED, quizSkill, 'Quiz skill created successfully');
    } catch (error) {
      return ResponseHelper.error(
        error,
        HttpStatus.BAD_REQUEST,
        'Failed to create quiz skill',
      );
    }
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() updateQuizSkillDto: UpdateQuizSkillDto) {
    try {
      const quizSkill = await this.quizSkillService.update(id, updateQuizSkillDto);
      return ResponseHelper.success(HttpStatus.OK, quizSkill, 'Quiz skill updated successfully');
    } catch (error) {
      return ResponseHelper.error(
        error,
        HttpStatus.BAD_REQUEST,
        'Failed to update quiz skill',
      );
    }
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    try {
      await this.quizSkillService.remove(id);
      return ResponseHelper.success(HttpStatus.OK, null, 'Quiz skill deleted successfully');
    } catch (error) {
      return ResponseHelper.error(
        error,
        HttpStatus.INTERNAL_SERVER_ERROR,
        'Failed to delete quiz skill',
      );
    }
  }
}
