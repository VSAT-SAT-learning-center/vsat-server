import { Controller, Get, Post, Body, Param, Delete, Query, Put, HttpStatus } from '@nestjs/common';
import { CreateExamTypeDto } from './dto/create-examtype.dto';
import { UpdateExamTypeDto } from './dto/update-examtype.dto';
import { ExamTypeService } from './exam-type.service';
import { PaginationOptionsDto } from 'src/common/dto/pagination-options.dto.ts';
import { ResponseHelper } from 'src/common/helpers/response.helper';

@Controller('examtypes')
export class ExamTypeController {
  constructor(private readonly examTypeService: ExamTypeService) {}

  @Get()
  async findAll(@Query() paginationOptions: PaginationOptionsDto) {
    const { data, totalItems, totalPages } = await this.examTypeService.findAll(paginationOptions);

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

    return ResponseHelper.success(HttpStatus.OK, data, 'Exam types retrieved successfully', paging, sorting);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const examType = await this.examTypeService.findOne(id);
    return ResponseHelper.success(HttpStatus.OK, examType, 'Exam type retrieved successfully');
  }

  @Post()
  async create(@Body() createExamTypeDto: CreateExamTypeDto) {
    const examType = await this.examTypeService.create(createExamTypeDto);
    return ResponseHelper.success(HttpStatus.CREATED, examType, 'Exam type created successfully');
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() updateExamTypeDto: UpdateExamTypeDto) {
    const examType = await this.examTypeService.update(id, updateExamTypeDto);
    return ResponseHelper.success(HttpStatus.OK, examType, 'Exam type updated successfully');
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    await this.examTypeService.remove(id);
    return ResponseHelper.success(HttpStatus.OK, null, 'Exam type deleted successfully');
  }
}
