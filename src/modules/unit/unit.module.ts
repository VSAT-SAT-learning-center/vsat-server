import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UnitService } from './unit.service';
import { UnitController } from './unit.controller';
import { Unit } from 'src/database/entities/unit.entity';
import { PaginationService } from 'src/common/helpers/pagination.service';

@Module({
  imports: [TypeOrmModule.forFeature([Unit])],
  controllers: [UnitController],
  providers: [UnitService, PaginationService],
})

export class UnitModule {}
