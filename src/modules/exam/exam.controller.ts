import { Controller, Get, Post, Body, Param, Delete, Query, Put, HttpStatus } from '@nestjs/common';
import { ExamService } from './exam.service';
import { CreateExamDto } from './dto/create-exam.dto';
import { UpdateExamDto } from './dto/update-exam.dto';
import { PaginationOptionsDto } from 'src/common/dto/pagination-options.dto.ts';
import { ResponseHelper } from 'src/common/helpers/response.helper';

@Controller('exams')
export class ExamController {
  constructor(private readonly examService: ExamService) {}

  @Get()
  async findAll(@Query() paginationOptions: PaginationOptionsDto) {
    const { data, totalItems, totalPages } = await this.examService.findAll(paginationOptions);

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

    return ResponseHelper.success(HttpStatus.OK, data, 'Exams retrieved successfully', paging, sorting);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const exam = await this.examService.findOne(id);
    return ResponseHelper.success(HttpStatus.OK, exam, 'Exam retrieved successfully');
  }

  @Post()
  async create(@Body() createExamDto: CreateExamDto) {
    const exam = await this.examService.create(createExamDto);
    return ResponseHelper.success(HttpStatus.CREATED, exam, 'Exam created successfully');
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() updateExamDto: UpdateExamDto) {
    const exam = await this.examService.update(id, updateExamDto);
    return ResponseHelper.success(HttpStatus.OK, exam, 'Exam updated successfully');
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    await this.examService.remove(id);
    return ResponseHelper.success(HttpStatus.OK, null, 'Exam deleted successfully');
  }
}
