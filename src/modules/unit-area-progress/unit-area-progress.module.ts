import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UnitAreaProgress } from 'src/database/entities/unitareaprogress.entity';
import { UnitAreaProgressService } from './unit-area-progress.service';
import { UnitAreaProgressController } from './unit-area-progress.controller';
import { LessonProgressModule } from '../lesson-progress/lesson-progress.module';
import { UnitAreaModule } from '../unit-area/unit-area.module';
import { UnitProgressModule } from '../unit-progress/unit-progress.module';

@Module({
    imports: [
        TypeOrmModule.forFeature([UnitAreaProgress]),
        UnitAreaModule,
        UnitProgressModule,
        forwardRef(() => LessonProgressModule),
    ],

    providers: [UnitAreaProgressService],
    controllers: [UnitAreaProgressController],
    exports: [UnitAreaProgressService],
})
export class UnitAreaProgressModule {}
