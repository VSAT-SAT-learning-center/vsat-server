import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UnitArea } from 'src/database/entities/unitarea.entity';
import { UnitAreaController } from './unit-area.controller';
import { UnitAreaService } from './unit-area.service';
import { PaginationService } from 'src/common/helpers/pagination.service';
import { UnitModule } from '../unit/unit.module';

@Module({
    imports: [TypeOrmModule.forFeature([UnitArea]), UnitModule],
    controllers: [UnitAreaController],
    providers: [UnitAreaService, PaginationService],
    exports: [UnitAreaService],
})
export class UnitAreaModule {}
