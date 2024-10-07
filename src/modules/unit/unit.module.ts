import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UnitService } from './unit.service';
import { UnitController } from './unit.controller';
import { Unit } from 'src/database/entities/unit.entity';
import { PaginationService } from 'src/common/helpers/pagination.service';
import { LevelService } from '../level/level.service';
import { SectionService } from '../section/section.service';
import { Section } from 'src/database/entities/section.entity';
import { Level } from 'src/database/entities/level.entity';
import { LevelModule } from '../level/level.module';
import { SectionModule } from '../section/section.module';

@Module({
    imports: [TypeOrmModule.forFeature([Unit]), LevelModule, SectionModule],
    controllers: [UnitController],
    providers: [
      UnitService, 
      PaginationService],
    exports: [UnitService],
})
export class UnitModule {}
