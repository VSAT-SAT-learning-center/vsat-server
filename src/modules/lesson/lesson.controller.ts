import {
    Controller,
    Post,
    Body,
    Param,
    Patch,
    HttpStatus,
    Get,
    UseGuards,
} from '@nestjs/common';
import { LessonService } from './lesson.service';
import { CreateLessonDto } from './dto/create-lesson.dto';
import { UpdateLessonDto } from './dto/update-lesson.dto';
import { ResponseHelper } from 'src/common/helpers/response.helper';
import { SuccessMessages } from 'src/common/message/success-messages';
import { BaseController } from '../base/base.controller';
import { Lesson } from 'src/database/entities/lesson.entity';
import { ApiBody, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { LessonProgressService } from '../lesson-progress/lesson-progress.service';
import { RoleGuard } from 'src/common/guards/role.guard';
import { JwtAuthGuard } from 'src/common/guards/jwt.guard';
import { UpdateLessonWithContentsDto } from './dto/update-lesson-with-contents.dto';

@ApiTags('Lessons')
@Controller('lessons')
export class LessonController extends BaseController<Lesson> {
    constructor(
        private readonly lessonService: LessonService,
    ) {
        super(lessonService, 'Lesson');
    }

    @UseGuards(JwtAuthGuard, new RoleGuard(['staff']))
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
        return ResponseHelper.success(HttpStatus.OK, unit, SuccessMessages.get('Lesson'));
    }

    @UseGuards(JwtAuthGuard, new RoleGuard(['staff']))
    @Post()
    async create(@Body() createLessonDto: CreateLessonDto) {
        const createdLesson = await this.lessonService.create(createLessonDto);
        return ResponseHelper.success(
            HttpStatus.CREATED,
            createdLesson,
            SuccessMessages.create('Lesson'),
        );
    }

    @ApiBody({
        description: 'Update lesson with its contents',
        type: UpdateLessonWithContentsDto,
    })
    @ApiOperation({ summary: 'Update lessons and their contents' })
    @UseGuards(JwtAuthGuard, new RoleGuard(['staff']))
    @Post('/update')
    async updateLessonsWithContents(@Body() lessonsData: UpdateLessonWithContentsDto) {
        return await this.lessonService.updateLessonsWithContents(lessonsData);
    }
}
