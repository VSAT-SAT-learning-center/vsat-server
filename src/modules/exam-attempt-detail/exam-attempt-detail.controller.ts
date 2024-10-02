import { Controller, Get, Post, Body, Param, Delete, Query, Put, HttpStatus } from '@nestjs/common';
import { CreateExamAttemptDetailDto } from './dto/create-examattemptdetail.dto';
import { UpdateExamAttemptDetailDto } from './dto/update-examattemptdetail.dto';
import { ExamAttemptDetailService } from './exam-attempt-detail.service';
import { PaginationOptionsDto } from 'src/common/dto/pagination-options.dto.ts';
import { ResponseHelper } from 'src/common/helpers/response.helper';

@Controller('examattemptdetails')
export class ExamAttemptDetailController {
  constructor(private readonly examAttemptDetailService: ExamAttemptDetailService) {}

  @Get()
  async findAll(@Query() paginationOptions: PaginationOptionsDto) {
    const { data, totalItems, totalPages } = await this.examAttemptDetailService.findAll(paginationOptions);

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

    return ResponseHelper.success(HttpStatus.OK, data, 'Exam attempt details retrieved successfully', paging, sorting);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const examAttemptDetail = await this.examAttemptDetailService.findOne(id);
    return ResponseHelper.success(HttpStatus.OK, examAttemptDetail, 'Exam attempt detail retrieved successfully');
  }

  @Post()
  async create(@Body() createExamAttemptDetailDto: CreateExamAttemptDetailDto) {
    const examAttemptDetail = await this.examAttemptDetailService.create(createExamAttemptDetailDto);
    return ResponseHelper.success(HttpStatus.CREATED, examAttemptDetail, 'Exam attempt detail created successfully');
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() updateExamAttemptDetailDto: UpdateExamAttemptDetailDto) {
    const examAttemptDetail = await this.examAttemptDetailService.update(id, updateExamAttemptDetailDto);
    return ResponseHelper.success(HttpStatus.OK, examAttemptDetail, 'Exam attempt detail updated successfully');
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    await this.examAttemptDetailService.remove(id);
    return ResponseHelper.success(HttpStatus.OK, null, 'Exam attempt detail deleted successfully');
  }
}
