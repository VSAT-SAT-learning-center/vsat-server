import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UnitArea } from 'src/database/entities/unitarea.entity';
import { UnitAreaController } from './unit-area.controller';
import { UnitAreaService } from './unit-area.service';
import { PaginationService } from 'src/common/helpers/pagination.service';
import { UnitService } from '../unit/unit.service';
import { Unit } from 'src/database/entities/unit.entity';

@Module({
    imports: [TypeOrmModule.forFeature([UnitArea, Unit])],
    controllers: [UnitAreaController],
    providers: [UnitAreaService, PaginationService, UnitService],
    exports: [UnitAreaService],
})
export class UnitAreaModule {}
