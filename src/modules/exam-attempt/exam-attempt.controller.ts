import { Controller, Get, Post, Body, Param, Delete, Query, Put, HttpStatus } from '@nestjs/common';
import { CreateExamAttemptDto } from './dto/create-examattempt.dto';
import { UpdateExamAttemptDto } from './dto/update-examattempt.dto';
import { ExamAttemptService } from './exam-attempt.service';
import { PaginationOptionsDto } from 'src/common/dto/pagination-options.dto.ts';
import { ResponseHelper } from 'src/common/helpers/response.helper';

@Controller('examattempts')
export class ExamAttemptController {
  constructor(private readonly examAttemptService: ExamAttemptService) {}

  @Get()
  async findAll(@Query() paginationOptions: PaginationOptionsDto) {
    const { data, totalItems, totalPages } = await this.examAttemptService.findAll(paginationOptions);

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

    return ResponseHelper.success(HttpStatus.OK, data, 'Exam attempts retrieved successfully', paging, sorting);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const examAttempt = await this.examAttemptService.findOne(id);
    return ResponseHelper.success(HttpStatus.OK, examAttempt, 'Exam attempt retrieved successfully');
  }

  @Post()
  async create(@Body() createExamAttemptDto: CreateExamAttemptDto) {
    const examAttempt = await this.examAttemptService.create(createExamAttemptDto);
    return ResponseHelper.success(HttpStatus.CREATED, examAttempt, 'Exam attempt created successfully');
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() updateExamAttemptDto: UpdateExamAttemptDto) {
    const examAttempt = await this.examAttemptService.update(id, updateExamAttemptDto);
    return ResponseHelper.success(HttpStatus.OK, examAttempt, 'Exam attempt updated successfully');
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    await this.examAttemptService.remove(id);
    return ResponseHelper.success(HttpStatus.OK, null, 'Exam attempt deleted successfully');
  }
}
