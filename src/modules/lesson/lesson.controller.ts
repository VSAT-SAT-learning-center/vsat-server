import {
    Controller,
    Post,
    Body,
    Param,
    Patch,
    HttpStatus,
} from '@nestjs/common';
import { LessonService } from './lesson.service';
import { CreateLessonDto } from './dto/create-lesson.dto';
import { UpdateLessonDto } from './dto/update-lesson.dto';
import { ResponseHelper } from 'src/common/helpers/response.helper';
import { SuccessMessages } from 'src/common/constants/success-messages';
import { BaseController } from '../base/base.controller';
import { Lesson } from 'src/database/entities/lesson.entity';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Lessons')
@Controller('lessons')
export class LessonController extends BaseController<Lesson> {
    constructor(private readonly lessonService: LessonService) {
        super(lessonService, 'Lesson');
    }

    @Post()
    async create(@Body() createLessonDto: CreateLessonDto) {
        try {
            const createdLesson = await this.lessonService.create(createLessonDto);
            return ResponseHelper.success(
                HttpStatus.CREATED,
                createdLesson,
                SuccessMessages.create('Lesson'),
            );
        } catch (error) {
            return ResponseHelper.error(
                error,
                HttpStatus.BAD_REQUEST,
                'Failed to create Lesson',
            );
        }
    }

    @Patch(':id')
    async update(@Param('id') id: string, @Body() updateLessonDto: UpdateLessonDto) {
        try {
            const updatedLesson = await this.lessonService.update(id, updateLessonDto);
            return ResponseHelper.success(
                HttpStatus.OK,
                updatedLesson,
                SuccessMessages.update('Lesson'),
            );
        } catch (error) {
            return ResponseHelper.error(
                error,
                HttpStatus.BAD_REQUEST,
                'Failed to update Lesson',
            );
        }
    }
}

