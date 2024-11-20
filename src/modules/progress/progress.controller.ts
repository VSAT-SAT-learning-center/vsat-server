import {
    Body,
    Controller,
    Get,
    HttpStatus,
    Param,
    Patch,
    UseGuards,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ProgressService } from './progress.service';
import { ResponseHelper } from 'src/common/helpers/response.helper';
import { UpdateLessonProgressStatusDto } from '../lesson-progress/dto/update-lessonprogress-status.dto';
import { UnitProgressService } from '../unit-progress/unit-progress.service';
import { JwtAuthGuard } from 'src/common/guards/jwt.guard';
import { RoleGuard } from 'src/common/guards/role.guard';

@ApiTags('Progress')
@Controller('progress')
@UseGuards(JwtAuthGuard, new RoleGuard(['student', 'teacher']))
export class ProgressController {
    constructor(
        private readonly progressService: ProgressService,
        private readonly unitProgressService: UnitProgressService,
    ) {}

    // @Patch('update')
    // @ApiOperation({ summary: 'Update progress for lesson, unit area, and unit' })
    // async updateProgress(
    //     @Body() updateLessonProgressStatusDto: UpdateLessonProgressStatusDto,
    // ) {
    //     // Gọi hàm updateProgress từ ProgressService để xử lý cập nhật tiến trình
    //     const updatedProgress = await this.progressService.updateProgress(
    //         updateLessonProgressStatusDto.lessonId,
    //         updateLessonProgressStatusDto,
    //     );

    //     return ResponseHelper.success(
    //         HttpStatus.OK,
    //         updatedProgress,
    //         'Progress updated successfully',
    //     );
    // }

    @Get(':targetLearningId/recent-units')
    @ApiOperation({ summary: 'Get recently learned units' })
    async getRecentlyLearnedUnits(@Param('targetLearningId') targetLearningId: string) {
        const recentUnits =
            await this.unitProgressService.getRecentlyLearnedUnits(targetLearningId);
        return ResponseHelper.success(
            HttpStatus.OK,
            recentUnits,
            'Recently learned units retrieved successfully',
        );
    }
}
