import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PaginationService } from 'src/common/helpers/pagination.service';
import { UnitArea } from 'src/database/entities/unitarea.entity';
import { UnitAreaProgress } from 'src/database/entities/unitareaprogress.entity';
import { UnitProgress } from 'src/database/entities/unitprogress.entity';
import { UnitAreaProgressService } from './unit-area-progress.service';
import { UnitAreaProgressController } from './unit-area-progress.controller';

@Module({
  imports: [TypeOrmModule.forFeature([UnitAreaProgress, UnitArea, UnitProgress])],
  providers: [UnitAreaProgressService, PaginationService],
  controllers: [UnitAreaProgressController],
})
export class UnitAreaProgressModule {}
