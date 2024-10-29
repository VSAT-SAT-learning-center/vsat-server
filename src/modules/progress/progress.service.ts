import { Injectable } from '@nestjs/common';
import { LessonProgressService } from '../lesson-progress/lesson-progress.service';
import { UnitAreaProgressService } from '../unit-area-progress/unit-area-progress.service';
import { UnitProgressService } from '../unit-progress/unit-progress.service';
import { LessonService } from '../lesson/lesson.service';
import { ExamService } from '../exam/exam.service';
import { UpdateLessonProgressStatusDto } from '../lesson-progress/dto/update-lessonprogress-status.dto';

@Injectable()
export class ProgressService {
    constructor(
        private readonly lessonProgressService: LessonProgressService,
        private readonly unitAreaProgressService: UnitAreaProgressService,
        private readonly unitProgressService: UnitProgressService,
    ) {}

    // async updateProgress(
    //     lessonId: string,
    //     updateLessonProgressStatusDto: UpdateLessonProgressStatusDto,
    // ) {
    //     // Cập nhật tiến trình cho bài học
    //     await this.lessonProgressService.updateLessonProgressStatus(lessonId, updateLessonProgressStatusDto);

    //     // Lấy unitAreaProgressId từ DTO để cập nhật UnitAreaProgress
    //     const { unitAreaProgressId, targetLearningId } = updateLessonProgressStatusDto;

    //     // Cập nhật tiến trình của UnitArea
    //     const unitId = await this.unitAreaProgressService.updateUnitAreaProgressNow(targetLearningId, unitAreaProgressId);

    //     // Cập nhật tiến trình của Unit sau khi đã cập nhật UnitArea
    //     await this.unitProgressService.updateUnitProgressNow(targetLearningId, unitId);

    //     return { message: 'Progress updated successfully' };
    // }
}
