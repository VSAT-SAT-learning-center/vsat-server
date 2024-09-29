import { Controller, Get, Post, Body, Param, Patch, Delete, HttpStatus } from '@nestjs/common';
import { LessonContentService } from './lesson-content.service';
import { CreateLessonContentDto } from './dto/create-lessoncontent.dto';
import { UpdateLessonContentDto } from './dto/update-lessoncontent.dto';
import { ResponseHelper } from 'src/common/helpers/response.helper';
import { SuccessMessages } from 'src/common/constants/success-messages';

@Controller('lessoncontents')
export class LessonContentController {
  constructor(private readonly lessonContentService: LessonContentService) {}

  @Post()
  async create(@Body() createLessonContentDto: CreateLessonContentDto) {
    try {
      const lessonContent = await this.lessonContentService.create(createLessonContentDto);
      return ResponseHelper.success(HttpStatus.CREATED, lessonContent, SuccessMessages.create('Lesson Content'));
    } catch (error) {
      return ResponseHelper.error(error, HttpStatus.BAD_REQUEST, 'Failed to create lesson content');
    }
  }

  @Get()
  async findAll() {
    try {
      const lessonContents = await this.lessonContentService.findAll();
      return ResponseHelper.success(HttpStatus.OK, lessonContents, SuccessMessages.gets('Lesson Contents'));
    } catch (error) {
      return ResponseHelper.error(error, HttpStatus.INTERNAL_SERVER_ERROR, 'Failed to retrieve lesson contents');
    }
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    try {
      const lessonContent = await this.lessonContentService.findOne(id);
      if (!lessonContent) {
        return ResponseHelper.error(null, HttpStatus.NOT_FOUND, 'Lesson content not found');
      }
      return ResponseHelper.success(HttpStatus.OK, lessonContent, SuccessMessages.get('Lesson Content'));
    } catch (error) {
      return ResponseHelper.error(error, HttpStatus.INTERNAL_SERVER_ERROR, 'Failed to retrieve lesson content');
    }
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() updateLessonContentDto: UpdateLessonContentDto) {
    try {
      const updatedLessonContent = await this.lessonContentService.update(id, updateLessonContentDto);
      return ResponseHelper.success(HttpStatus.OK, updatedLessonContent, SuccessMessages.update('Lesson Content'));
    } catch (error) {
      return ResponseHelper.error(error, HttpStatus.BAD_REQUEST, 'Failed to update lesson content');
    }
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    try {
      await this.lessonContentService.remove(id);
      return ResponseHelper.success(HttpStatus.OK, null, SuccessMessages.delete('Lesson Content'));
    } catch (error) {
      return ResponseHelper.error(error, HttpStatus.INTERNAL_SERVER_ERROR, 'Failed to delete lesson content');
    }
  }
}