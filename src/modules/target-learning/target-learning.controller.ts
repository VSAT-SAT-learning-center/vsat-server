import {
    Controller,
    Get,
    Post,
    Body,
    Param,
    Delete,
    Query,
    Put,
    HttpStatus,
    HttpException,
    Inject,
    forwardRef,
    Request,
    UseGuards,
    Patch,
} from '@nestjs/common';
import { TargetLearningService } from './target-learning.service';
import { ResponseHelper } from 'src/common/helpers/response.helper';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';
import { SuccessMessages } from 'src/common/message/success-messages';
import { TargetLearningDetailService } from '../target-learning-detail/target-learning-detail.service';
import { UnitService } from '../unit/unit.service';
import { JwtAuthGuard } from 'src/common/guards/jwt.guard';
import { RoleGuard } from 'src/common/guards/role.guard';
import { LessonProgressService } from '../lesson-progress/lesson-progress.service';
import { TargetLearningStatus } from 'src/common/enums/target-learning-status.enum';

@ApiTags('TargetLearnings')
@Controller('target-learnings')
@ApiBearerAuth('JWT-auth')
export class TargetLearningController {
    constructor(
        private readonly targetLearningService: TargetLearningService,
        private readonly targetLearningDetailService: TargetLearningDetailService,
        @Inject(forwardRef(() => UnitService))
        private readonly unitService: UnitService,
        private readonly lessonProgressService: LessonProgressService,
    ) {}

    @Get('getStatisticByTargetLearning')
    async getWithExamAttempt(@Query('targetLearningId') targetLearningId: string) {
        try {
            const targetLearning =
                await this.targetLearningService.getWithExamAttempt(targetLearningId);
            return ResponseHelper.success(
                HttpStatus.OK,
                targetLearning,
                SuccessMessages.get('TargetLearning'),
            );
        } catch (error) {
            throw new HttpException(
                {
                    statusCode: error.status || HttpStatus.BAD_REQUEST,
                    message: error.message || 'An error occurred',
                },
                error.status || HttpStatus.BAD_REQUEST,
            );
        }
    }

    @Get('getTargetLearningByStudyProfile')
    async getTargetLearningByStudyProfile(
        @Query('studyProfileId') studyProfileId: string,
    ) {
        try {
            const targetLearning =
                await this.targetLearningService.getTargetLearningByStudyProfile(
                    studyProfileId,
                );
            return ResponseHelper.success(
                HttpStatus.OK,
                targetLearning,
                SuccessMessages.get('TargetLearning'),
            );
        } catch (error) {
            throw new HttpException(
                {
                    statusCode: error.status || HttpStatus.BAD_REQUEST,
                    message: error.message || 'An error occurred',
                },
                error.status || HttpStatus.BAD_REQUEST,
            );
        }
    }

    @Get('unit/:sectionId')
    async getUnitsBySectionAndLevel(@Param('sectionId') sectionId: string): Promise<any> {
        return this.unitService.findAllBySectionAndLevel(sectionId);
    }

    @Get('getTargetLearningByAccount')
    @UseGuards(JwtAuthGuard, new RoleGuard(['student']))
    async getTargetLearningByAccount(@Request() req) {
        try {
            const targetLearning =
                await this.targetLearningService.getTargetLearningByStudyProfile(
                    req.user.id,
                );
            return ResponseHelper.success(
                HttpStatus.OK,
                targetLearning,
                SuccessMessages.get('TargetLearning'),
            );
        } catch (error) {
            throw new HttpException(
                {
                    statusCode: error.status || HttpStatus.BAD_REQUEST,
                    message: error.message || 'An error occurred',
                },
                error.status || HttpStatus.BAD_REQUEST,
            );
        }
    }

    @Get(':targetLearningId/unit-progresses')
    async getUnitProgressesByTargetLearning(
        @Query('targetLearningId') targetLearningId: string,
    ) {
        try {
            const unitProgresses =
                await this.targetLearningDetailService.getAllUnitProgress(
                    targetLearningId,
                );
            return ResponseHelper.success(
                HttpStatus.OK,
                unitProgresses,
                SuccessMessages.get('UnitProgresses'),
            );
        } catch (error) {
            throw new HttpException(
                {
                    statusCode: error.status || HttpStatus.BAD_REQUEST,
                    message: error.message || 'An error occurred',
                },
                error.status || HttpStatus.BAD_REQUEST,
            );
        }
    }

    @UseGuards(JwtAuthGuard, new RoleGuard(['student']))
    @ApiOperation({ summary: 'Student complete a lesson' })
    @Patch(':lessonProgressId/complete')
    async completeLessonProgress(@Param('lessonProgressId') lessonProgressId: string) {
        // Gọi service để cập nhật tiến trình khi học sinh hoàn thành bài học
        const result =
            await this.lessonProgressService.completeLessonProgress(lessonProgressId);

        return {
            statusCode: HttpStatus.CREATED,
            message: 'Lesson completed and progress updated successfully',
            data: result,
        };
    }

    @Get(':targetLearningId/recent-learning')
    async getRecentUnitProgress(
        @Param('targetLearningId') targetLearningId: string,
    ): Promise<any[]> {
        try {
            return await this.targetLearningDetailService.getRecentUnitProgressWithDetails(
                targetLearningId,
            );
        } catch (error) {
            throw new HttpException(
                error.message || 'Internal Server Error',
                HttpStatus.BAD_REQUEST,
            );
        }
    }

    @Put(':id')
    @ApiBody({
        type: String,
        enum: TargetLearningStatus,
    })
    @UseGuards(JwtAuthGuard, new RoleGuard(['teacher']))
    async updateTargetLearningStatus(
        @Param('id') id: string,
        @Request() req,
        @Body() targetLearningStatus: { status: TargetLearningStatus },
    ) {
        const userId = req.user?.id;
        const updatedTargetLearning =
            await this.targetLearningService.updateTargetLearningStatus(id, targetLearningStatus.status, userId);

        
        return ResponseHelper.success(
            HttpStatus.OK,
            updatedTargetLearning,
            SuccessMessages.update('TargetLearning'),
        );
    }
}
