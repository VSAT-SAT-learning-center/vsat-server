import { Module } from '@nestjs/common';
import { ProgressService } from './progress.service';
import { ProgressController } from './progress.controller';
import { LessonProgressModule } from '../lesson-progress/lesson-progress.module';
import { UnitAreaProgressModule } from '../unit-area-progress/unit-area-progress.module';
import { UnitProgressModule } from '../unit-progress/unit-progress.module';

@Module({
    imports: [UnitProgressModule, UnitAreaProgressModule, LessonProgressModule],
    providers: [ProgressService],
    controllers: [ProgressController],
})
export class ProgressModule {}
