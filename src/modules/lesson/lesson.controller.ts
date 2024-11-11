import {
    Controller,
    Post,
    Body,
    Param,
    Patch,
    HttpStatus,
    Get,
    Query,
    UseGuards,
} from '@nestjs/common';
import { LessonService } from './lesson.service';
import { CreateLessonDto } from './dto/create-lesson.dto';
import { UpdateLessonDto } from './dto/update-lesson.dto';
import { ResponseHelper } from 'src/common/helpers/response.helper';
import { SuccessMessages } from 'src/common/constants/success-messages';
import { BaseController } from '../base/base.controller';
import { Lesson } from 'src/database/entities/lesson.entity';
import { ApiBody, ApiParam, ApiTags } from '@nestjs/swagger';
import { StartLessonProgressDto } from './dto/start-lesson-progress.dto';
import { CompleteLessonProgressDto } from './dto/complete-lesson-progress.dto';
import { LessonProgressService } from '../lesson-progress/lesson-progress.service';
import { RoleGuard } from 'src/common/guards/role.guard';
import { JwtAuthGuard } from 'src/common/guards/jwt.guard';

@ApiTags('Lessons')
@Controller('lessons')
export class LessonController extends BaseController<Lesson> {
    constructor(
        private readonly lessonService: LessonService,
        private readonly lessonProgressService: LessonProgressService,
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
        const unit = await this.lessonService.findOneById(id, [
            'lessonContents',
        ]);
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

    @Post(':lessonId/start')
    async startLessonProgress(
        @Param('lessonId') lessonId: string,
        @Body() lessonProgressDto: StartLessonProgressDto,
    ) {
        const { targetLearningId, unitAreaId, unitId } = lessonProgressDto;

        // Gọi service để khởi động tiến trình bài học
        const lessonProgress = await this.lessonService.startLessonProgress(
            lessonId,
            targetLearningId,
            unitAreaId,
            unitId,
        );

        return {
            statusCode: HttpStatus.CREATED,
            message: 'Lesson progress started successfully',
            data: lessonProgress,
        };
    }

    @Patch(':lessonId/complete')
    async completeLessonProgress(
        @Param('lessonId') lessonId: string,
        @Body() lessonProgressDto: CompleteLessonProgressDto,
    ) {
        // Gọi service để cập nhật tiến trình khi học sinh hoàn thành bài học
        const result = await this.lessonService.completeLessonProgress(
            lessonId,
            lessonProgressDto,
        );

        return {
            statusCode: HttpStatus.CREATED,
            message: 'Lesson completed and progress updated successfully',
            data: result,
        };
    }

    @Get('recent')
    async getRecentCompletedLessons(
        @Query('targetLearningId') targetLearningId: string,
        @Query('limit') limit: number = 5,
    ) {
        const recentLessons =
            await this.lessonProgressService.getRecentCompletedLessons(
                targetLearningId,
                limit,
            );

        return {
            message: 'Recent completed lessons retrieved successfully',
            recentLessons,
        };
    }

    @Get('recent/progressing')
    async getRecentProgressingLessons(
        @Query('targetLearningId') targetLearningId: string,
        @Query('limit') limit: number = 5,
    ) {
        // Gọi service để lấy danh sách các bài học đang học gần đây
        const recentLessons =
            await this.lessonProgressService.getRecentProgressingLessons(
                targetLearningId,
                limit,
            );

        return {
            message: 'Recent progressing lessons retrieved successfully',
            recentLessons,
        };
    }
}
