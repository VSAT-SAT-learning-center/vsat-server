import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UnitArea } from 'src/database/entities/unitarea.entity';
import { UnitAreaController } from './unit-area.controller';
import { UnitAreaService } from './unit-area.service';
import { PaginationService } from 'src/common/helpers/pagination.service';
import { UnitModule } from '../unit/unit.module';
import { LessonModule } from '../lesson/lesson.module';

@Module({
    imports: [TypeOrmModule.forFeature([UnitArea]), 
    UnitModule, 
    forwardRef(() => LessonModule)],
    controllers: [UnitAreaController],
    providers: [UnitAreaService],
    exports: [UnitAreaService],
})
export class UnitAreaModule {}
