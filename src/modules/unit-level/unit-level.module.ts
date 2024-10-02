import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PaginationService } from 'src/common/helpers/pagination.service';
import { Level } from 'src/database/entities/level.entity';
import { Unit } from 'src/database/entities/unit.entity';
import { UnitLevel } from 'src/database/entities/unitlevel.entity';
import { UnitLevelService } from './unit-level.service';
import { UnitLevelController } from './unit-level.controller';

@Module({
  imports: [TypeOrmModule.forFeature([UnitLevel, Unit, Level])],
  providers: [UnitLevelService, PaginationService],
  controllers: [UnitLevelController],
})
export class UnitLevelModule {}
