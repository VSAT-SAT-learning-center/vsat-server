import { Controller, Get, Post, Body, Param, Delete, Query, Put, HttpStatus } from '@nestjs/common';
import { CommentService } from './comment.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { PaginationOptionsDto } from 'src/common/dto/pagination-options.dto.ts';
import { ResponseHelper } from 'src/common/helpers/response.helper';

@Controller('comments')
export class CommentController {
  constructor(private readonly commentService: CommentService) {}

  @Get()
  async findAll(@Query() paginationOptions: PaginationOptionsDto) {
    const { data, totalItems, totalPages } = await this.commentService.findAll(paginationOptions);

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

    return ResponseHelper.success(HttpStatus.OK, data, 'Comments retrieved successfully', paging, sorting);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const comment = await this.commentService.findOne(id);
    return ResponseHelper.success(HttpStatus.OK, comment, 'Comment retrieved successfully');
  }

  @Post()
  async create(@Body() createCommentDto: CreateCommentDto) {
    const comment = await this.commentService.create(createCommentDto);
    return ResponseHelper.success(HttpStatus.CREATED, comment, 'Comment created successfully');
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() updateCommentDto: UpdateCommentDto) {
    const comment = await this.commentService.update(id, updateCommentDto);
    return ResponseHelper.success(HttpStatus.OK, comment, 'Comment updated successfully');
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    await this.commentService.remove(id);
    return ResponseHelper.success(HttpStatus.OK, null, 'Comment deleted successfully');
  }
}
