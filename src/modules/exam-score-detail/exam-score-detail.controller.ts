import { Controller, Get, Post, Body, Param, Delete, Query, Put, HttpStatus } from '@nestjs/common';
import { CreateExamScoreDetailDto } from './dto/create-examscoredetail.dto';
import { UpdateExamScoreDetailDto } from './dto/update-examscoredetail.dto';
import { ExamScoreDetailService } from './exam-score-detail.service';
import { PaginationOptionsDto } from 'src/common/dto/pagination-options.dto.ts';
import { ResponseHelper } from 'src/common/helpers/response.helper';

@Controller('examscoredetails')
export class ExamScoreDetailController {
  constructor(private readonly examScoreDetailService: ExamScoreDetailService) {}

  @Get()
  async findAll(@Query() paginationOptions: PaginationOptionsDto) {
    const { data, totalItems, totalPages } = await this.examScoreDetailService.findAll(paginationOptions);

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

    return ResponseHelper.success(HttpStatus.OK, data, 'Exam score details retrieved successfully', paging, sorting);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const examScoreDetail = await this.examScoreDetailService.findOne(id);
    return ResponseHelper.success(HttpStatus.OK, examScoreDetail, 'Exam score detail retrieved successfully');
  }

  @Post()
  async create(@Body() createExamScoreDetailDto: CreateExamScoreDetailDto) {
    const examScoreDetail = await this.examScoreDetailService.create(createExamScoreDetailDto);
    return ResponseHelper.success(HttpStatus.CREATED, examScoreDetail, 'Exam score detail created successfully');
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() updateExamScoreDetailDto: UpdateExamScoreDetailDto) {
    const examScoreDetail = await this.examScoreDetailService.update(id, updateExamScoreDetailDto);
    return ResponseHelper.success(HttpStatus.OK, examScoreDetail, 'Exam score detail updated successfully');
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    await this.examScoreDetailService.remove(id);
    return ResponseHelper.success(HttpStatus.OK, null, 'Exam score detail deleted successfully');
  }
}
