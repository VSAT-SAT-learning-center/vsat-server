import { Controller, Get, Post, Body, Param, Delete, Query, Put, HttpStatus } from '@nestjs/common';
import { FeedbackService } from './feedback.service';
import { CreateFeedbackDto } from './dto/create-feedback.dto';
import { UpdateFeedbackDto } from './dto/update-feedback.dto';
import { PaginationOptionsDto } from 'src/common/dto/pagination-options.dto.ts';
import { ResponseHelper } from 'src/common/helpers/response.helper';

@Controller('feedbacks')
export class FeedbackController {
  constructor(private readonly feedbackService: FeedbackService) {}

  @Get()
  async findAll(@Query() paginationOptions: PaginationOptionsDto) {
    const { data, totalItems, totalPages } = await this.feedbackService.findAll(paginationOptions);

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

    return ResponseHelper.success(HttpStatus.OK, data, 'Feedbacks retrieved successfully', paging, sorting);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const feedback = await this.feedbackService.findOne(id);
    return ResponseHelper.success(HttpStatus.OK, feedback, 'Feedback retrieved successfully');
  }

  @Post()
  async create(@Body() createFeedbackDto: CreateFeedbackDto) {
    const feedback = await this.feedbackService.create(createFeedbackDto);
    return ResponseHelper.success(HttpStatus.CREATED, feedback, 'Feedback created successfully');
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() updateFeedbackDto: UpdateFeedbackDto) {
    const feedback = await this.feedbackService.update(id, updateFeedbackDto);
    return ResponseHelper.success(HttpStatus.OK, feedback, 'Feedback updated successfully');
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    await this.feedbackService.remove(id);
    return ResponseHelper.success(HttpStatus.OK, null, 'Feedback deleted successfully');
  }
}
