import { Body, Controller, HttpStatus, Patch } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ProgressService } from './progress.service';
import { ResponseHelper } from 'src/common/helpers/response.helper';
import { UpdateLessonProgressStatusDto } from '../lesson-progress/dto/update-lessonprogress-status.dto';

@ApiTags('Progress')
@Controller('progress')
export class ProgressController {
    constructor(private readonly progressService: ProgressService) {}

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
}
