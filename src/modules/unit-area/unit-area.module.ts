import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UnitArea } from 'src/database/entities/unitarea.entity';
import { UnitAreaController } from './unit-area.controller';
import { UnitAreaService } from './unit-area.service';

@Module({
  imports: [TypeOrmModule.forFeature([UnitArea])],
  controllers: [UnitAreaController],
  providers: [UnitAreaService],
})
export class UnitAreaModule {}
