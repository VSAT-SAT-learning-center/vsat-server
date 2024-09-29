import { Controller, Get, Post, Body, Param, Patch, Delete, HttpStatus } from '@nestjs/common';
import { LessonService } from './lesson.service';
import { CreateLessonDto } from './dto/create-lesson.dto';
import { UpdateLessonDto } from './dto/update-lesson.dto';
import { ResponseHelper } from 'src/common/helpers/response.helper';
import { SuccessMessages } from 'src/common/constants/success-messages';

@Controller('lessons')
export class LessonController {
  constructor(private readonly lessonService: LessonService) {}

  @Post()
  async create(@Body() createLessonDto: CreateLessonDto) {
    try {
      const lesson = await this.lessonService.create(createLessonDto);
      return ResponseHelper.success(HttpStatus.CREATED, lesson, SuccessMessages.create('Lesson'));
    } catch (error) {
      return ResponseHelper.error(error, HttpStatus.BAD_REQUEST, 'Failed to create lesson');
    }
  }

  @Get()
  async findAll() {
    try {
      const lessons = await this.lessonService.findAll();
      return ResponseHelper.success(HttpStatus.OK, lessons, SuccessMessages.gets('Lessons'));
    } catch (error) {
      return ResponseHelper.error(error, HttpStatus.INTERNAL_SERVER_ERROR, 'Failed to retrieve lessons');
    }
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    try {
      const lesson = await this.lessonService.findOne(id);
      if (!lesson) {
        return ResponseHelper.error(null, HttpStatus.NOT_FOUND, 'Lesson not found');
      }
      return ResponseHelper.success(HttpStatus.OK, lesson, SuccessMessages.get('Lesson'));
    } catch (error) {
      return ResponseHelper.error(error, HttpStatus.INTERNAL_SERVER_ERROR, 'Failed to retrieve lesson');
    }
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() updateLessonDto: UpdateLessonDto) {
    try {
      const updatedLesson = await this.lessonService.update(id, updateLessonDto);
      return ResponseHelper.success(HttpStatus.OK, updatedLesson, SuccessMessages.update('Lesson'));
    } catch (error) {
      return ResponseHelper.error(error, HttpStatus.BAD_REQUEST, 'Failed to update lesson');
    }
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    try {
      await this.lessonService.remove(id);
      return ResponseHelper.success(HttpStatus.OK, null, SuccessMessages.delete('Lesson'));
    } catch (error) {
      return ResponseHelper.error(error, HttpStatus.INTERNAL_SERVER_ERROR, 'Failed to delete lesson');
    }
  }
}