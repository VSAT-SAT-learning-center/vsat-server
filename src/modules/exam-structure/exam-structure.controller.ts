import { Controller, Get, Post, Body, Param, Delete, Query, Put, HttpStatus } from '@nestjs/common';
import { ExamStructureService } from './examstructure.service';
import { CreateExamStructureDto } from './dto/create-examstructure.dto';
import { UpdateExamStructureDto } from './dto/update-examstructure.dto';
import { PaginationOptionsDto } from '../common/dto/pagination-options.dto';
import { ResponseHelper } from '../common/response.helper';

@Controller('examstructures')
export class ExamStructureController {
  constructor(private readonly examStructureService: ExamStructureService) {}

  @Get()
  async findAll(@Query() paginationOptions: PaginationOptionsDto) {
    const { data, totalItems, totalPages } = await this.examStructureService.findAll(paginationOptions);

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

    return ResponseHelper.success(HttpStatus.OK, data, 'Exam structures retrieved successfully', paging, sorting);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const examStructure = await this.examStructureService.findOne(id);
    return ResponseHelper.success(HttpStatus.OK, examStructure, 'Exam structure retrieved successfully');
  }

  @Post()
  async create(@Body() createExamStructureDto: CreateExamStructureDto) {
    const examStructure = await this.examStructureService.create(createExamStructureDto);
    return ResponseHelper.success(HttpStatus.CREATED, examStructure, 'Exam structure created successfully');
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() updateExamStructureDto: UpdateExamStructureDto) {
    const examStructure = await this.examStructureService.update(id, updateExamStructureDto);
    return ResponseHelper.success(HttpStatus.OK, examStructure, 'Exam structure updated successfully');
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    await this.examStructureService.remove(id);
    return ResponseHelper.success(HttpStatus.OK, null, 'Exam structure deleted successfully');
  }
}
