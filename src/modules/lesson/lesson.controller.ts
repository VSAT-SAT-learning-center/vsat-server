import {
    Controller,
    Post,
    Body,
    Param,
    Patch,
    HttpStatus,
    Get,
    HttpException,
} from '@nestjs/common';
import { LessonService } from './lesson.service';
import { CreateLessonDto } from './dto/create-lesson.dto';
import { UpdateLessonDto } from './dto/update-lesson.dto';
import { ResponseHelper } from 'src/common/helpers/response.helper';
import { SuccessMessages } from 'src/common/constants/success-messages';
import { BaseController } from '../base/base.controller';
import { Lesson } from 'src/database/entities/lesson.entity';
import { ApiBody, ApiParam, ApiTags } from '@nestjs/swagger';

@ApiTags('Lessons')
@Controller('lessons')
export class LessonController extends BaseController<Lesson> {
    constructor(private readonly lessonService: LessonService) {
        super(lessonService, 'Lesson');
    }

    @Post()
    @ApiBody({ type: UpdateLessonDto })
    async createLessonWithContent(@Body() updateLessonDto: UpdateLessonDto) {
        const lesson = await this.lessonService.createLesson(updateLessonDto);
        return {
            statusCode: HttpStatus.CREATED,
            message: 'Lesson and content created successfully',
            data: lesson,
        };
    }

    @Get(':id')
    @ApiParam({ name: 'id', description: 'Lesson ID' })
    async getLessonById(@Param('id') id: string) {
        const lesson = await this.lessonService.getLessonById(id);
        return {
            statusCode: HttpStatus.OK,
            message: 'Lesson retrieved successfully',
            data: lesson,
        };
    }

    @Get(':id')
    async findOne(@Param('id') id: string) {
        const unit = await this.lessonService.findOneById(id, ['lessonContents']);
        return ResponseHelper.success(
            HttpStatus.OK,
            unit,
            SuccessMessages.get('Lesson'),
        );
    }

    @Post()
    async create(@Body() createLessonDto: CreateLessonDto) {
        const createdLesson = await this.lessonService.create(createLessonDto);
        return ResponseHelper.success(
            HttpStatus.CREATED,
            createdLesson,
            SuccessMessages.create('Lesson'),
        );
    }

    @Patch(':id')

    async update(
        @Param('id') id: string,
        @Body() updateLessonDto: UpdateLessonDto,
    ) {
        const updatedLesson = await this.lessonService.update(
            id,
            updateLessonDto,
        );
        return ResponseHelper.success(
            HttpStatus.OK,
            updatedLesson,
            SuccessMessages.update('Lesson'),
        );
    }
}
