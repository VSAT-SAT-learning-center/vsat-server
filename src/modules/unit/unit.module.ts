import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UnitService } from './unit.service';
import { UnitController } from './unit.controller';
import { Unit } from 'src/database/entities/unit.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Unit])],
  controllers: [UnitController],
  providers: [UnitService],
})

export class UnitModule {}
